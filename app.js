function getUsers(params) {
  const { url, method = "GET" } = params;
  return $.ajax({
    url,
    method,
  });
}

const mappingWithFunction = {
  fullName: { fn: getName, isVisible: true },
  country: { fn: getCountry, isVisible: true },
  city: { fn: getCity, isVisible: true },
  address: { fn: getAdress, isVisible: true },
  src: { fn: getUserImgUrl, isVisible: true },
};

$(function () {
  const cardsContainer = $("#container");
  const numOfUserInLS = localStorage.getItem("numOfUsers");
  if (numOfUserInLS) init(numOfUserInLS, cardsContainer);

  $("#usersBtn").on("click", () => {
    const numberOfUsers = $("#inputGroupSelect01 option:selected").val();
    localStorage.setItem("numOfUsers", numberOfUsers);
    init(localStorage.getItem("numOfUsers"), cardsContainer);
  });
});

function getName(user) {
  return `${user.name.first} ${user.name.last}`;
}
function getCountry(user) {
  return user.location.country;
}
function getCity(user) {
  return user.location.city;
}
function getAdress(user) {
  return `${user.location.street.name} ${user.location.street.number}`;
}
function getUserImgUrl(user) {
  return user.picture.large;
}

async function init(numberOfUsers, cardsContainer) {
  try {
    const response = await getUsers({
      url: `https://randomuser.me/api/?results=${numberOfUsers}`,
    });
    const { results } = response;
    console.log(results);
    draw(results, cardsContainer);
  } catch (err) {
    console.log(err);
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
  const keyValueMappingArray = Object.entries(mappingWithFunction);

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

function getCardItem(user) {
  const cardWrap = $("<div></div>").attr("class", "card-wrap");
  const cardHead = $("<div></div>").attr("class", "card-head bg-light");
  const userImg = $(`<img src="${user.src}">`).attr("class", "card-user-img");
  const cardBody = $("<div></div>").attr("class", "card-body");
  const userName = $("<h5></h5>").text(user.fullName);
  const userCountry = $("<p>></p>").text(user.country);
  const userAdress = $("<p></p>").html(`${user.city} <br> ${user.address}`);

  cardHead.append(userImg);
  cardBody.append(userName, userCountry, userAdress);
  cardWrap.append(cardHead, cardBody);

  return cardWrap;
}
