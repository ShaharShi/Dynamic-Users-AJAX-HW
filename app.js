function getUsers(params) {
  const { url, method = "GET" } = params;
  return $.ajax({
    url,
    method,
  });
}

// const mappingWithFunction = {
//   fullName: { fn: getName, isVisible: true },
//   country: { fn: getCountry, isVisible: true },
//   city: { fn: getCity, isVisible: true },
//   address: { fn: getAdress, isVisible: true },
//   src: { fn: getUserImgUrl, isVisible: true },
// };
const mapping = {
  firstName: { path: "name.first", isVisible: true },
  lastName: { path: "name.last", isVisible: true },
  country: { path: "location.country", isVisible: true },
  city: { path: "location.city", isVisible: true },
  address: { path: "location.street.name", isVisible: true },
  src: { path: "picture.large", isVisible: true },
};

$(function () {
  let numberOfUsersRequested;
  const numberOfUsersValues = ["10", "20", "30", "40", "50"];
  const cardsContainer = $("#container");
  const numOfUserInLS = localStorage.getItem("numOfUsers");

  drawNumberOfValues(numberOfUsersValues);

  if (numOfUserInLS) {
    $("#inputGroupSelect01").val(numOfUserInLS);
    getData(numOfUserInLS, cardsContainer);
  }

  $("#usersBtn").on("click", () => {
    numberOfUsersRequested = $("#inputGroupSelect01 option:selected").val();
    localStorage.setItem("numOfUsers", numberOfUsersRequested);
    getData(localStorage.getItem("numOfUsers"), cardsContainer);
  });
});

// function getName(user) {
//   const pathArr = ["name.first", "name.last"];
//   const requestedVal = pathArr.map( path => { return checkVal(path, user) })
//   return requestedVal.toString().replace(/,/, ' ')
// }
// function getCountry(user) {
//   const pathArr = ["location.country"];
//   const requestedVal = pathArr.map( path => { return checkVal(path, user) })
//   return requestedVal.toString().replace(/,/, ' ')
// }
// function getCity(user) {
//   return user.location.city;
// }
// function getAdress(user) {
//   return `${user.location.street.name} ${user.location.street.number}`;
// }
// function getUserImgUrl(user) {
//   return user.picture.large;
// }

// function checkVal(currentPath, user) {
//   if (typeof currentPath !== "string") return
//   const splittedPath = currentPath.split('.')
//   return splittedPath.reduce((currentUser, partOfPath) => {
//     const thereIsVal = currentUser[partOfPath]
//     return thereIsVal ? currentUser[partOfPath]: 'Not Availble'
//   }, user)
// }

async function getData(numberOfUsers, cardsContainer) {
  try {
    const response = await getUsers({
      url: `https://randomuser.me/api/?results=${numberOfUsers}`,
    });
    const { results } = response;
    console.log(results);
    draw(results, cardsContainer);
  } catch (err) {
    console.error(err);
    console.error(`message: ${err.statusText} , status: ${err.status}`);
  }
}

function draw(arrOfObjects, cardsContainer) {
  cardsContainer.empty();
  const mappedUsers = arrOfObjects.map((user) => {
    return getMappedUser(user);
  });
  console.log(mappedUsers);

  const cards = mappedUsers.map((user) => {
    return getCardItem(user);
  });

  cardsContainer.append(...cards);
}

function getMappedUser(user) {
  const keyValueMappingArray = Object.entries(mapping);

  return keyValueMappingArray.reduce((mappedUser, KEYVALUEPAIR_ARRAY) => {
    const [key, settingObj] = KEYVALUEPAIR_ARRAY;
    const { path } = settingObj;
    const isFunction = typeof settingObj["fn"] === "function";
    return {
      ...mappedUser,
      [key]: isFunction ? settingObj["fn"](user) : getValueFromPath(path, user),
    };
  }, {});
}

function getValueFromPath(path, user) {
  if (typeof path !== "string") return;
  const splittedPath = path.split(".");
  const theRequestedValue = splittedPath.reduce((currentUser, partOfPath) => {
    const isValueExist = currentUser[partOfPath];
    return isValueExist ? currentUser[partOfPath] : "Not Available";
  }, user);
  return theRequestedValue;
}

function getCardItem(user) {
  const cardWrap = $("<div></div>").attr("class", "card-wrap");
  const cardHead = $("<div></div>").attr("class", "card-head bg-light");
  const userImg = $(`<img src="${user.src}">`).attr("class", "card-user-img");
  const cardBody = $("<div></div>").attr("class", "card-body");
  const userName = $("<h5></h5>").html(`${user.firstName} ${user.lastName}`);
  const userCountry = $("<p>></p>").text(user.country);
  const userAdress = $("<p></p>").html(`${user.city} <br> ${user.address}`);

  cardHead.append(userImg);
  cardBody.append(userName, userCountry, userAdress);
  cardWrap.append(cardHead, cardBody);

  return cardWrap;
}

function drawNumberOfValues(numberOfUsersArr) {
  const options = numberOfUsersArr.map((val) => {
    const option = $(`<option value='${val}'>${val} Users </option>`);
    return option;
  });

  $("#inputGroupSelect01").append(...options);
}
