function getData(params) {
  const { url, method = "GET" } = params;
  return $.ajax({
    url,
    method,
  });
}

const mappingUserData = {
  firstName: { path: "name.first", isVisible: true },
  lastName: { path: "name.last", isVisible: true },
  userUUID: { path: "login.uuid", isVisible: true },
  country: { path: "location.country", isVisible: true },
  city: { path: "location.city", isVisible: true },
  address: { fn: getAdress, isVisible: true },
  src: { path: "picture.large", isVisible: true },
};

function getAdress(user) {
  const pathArr = ["location.street.name", "location.street.number"];
  const requestedVal = pathArr.map( path => { return getValueFromPath(path, user) })
  return requestedVal.toString().replace(/,/, ' ')
}

$(function () {
  let numberOfUsersRequested;
  const numberOfUsersValues = ["10", "20", "30", "40", "50"];
  const cardsContainer = $("#container");
  const numOfUserInLS = localStorage.getItem("numOfUsers");
  localStorage.removeItem('langs');

  drawNumberOfValues(numberOfUsersValues);

  if (numOfUserInLS) {
    $("#inputGroupSelect01").val(numOfUserInLS);
    getUsersData(numOfUserInLS, cardsContainer);
  }

  $("#usersBtn").on("click", () => {
    numberOfUsersRequested = $("#inputGroupSelect01 option:selected").val();
    localStorage.setItem("numOfUsers", numberOfUsersRequested);
    getUsersData(localStorage.getItem("numOfUsers"), cardsContainer);
  });
});


async function getUsersData(numberOfUsers, cardsContainer) {
  try {
    const response = await getData({
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
  const keyValueMappingArray = Object.entries(mappingUserData);

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
  const langBtn = $("<button>My Languages</button>").attr("class", "btn btn-primary btn-sm");
  const langsContainer = $("<div></div>").attr('class', 'langs-container');

  langBtn.on('click', async () => {
    if (langsContainer.text().length > 0) { langsContainer.empty(); return}
    const langsArr = JSON.parse(localStorage.getItem('langs'));

    if (langsArr) {
      const isValueExist = langsArr.find(userObj => { 
        return userObj[user.userUUID]
      })
      
      const result = isValueExist ? isValueExist[user.userUUID] : await getLanguages(user.country, user.userUUID);
      langsContainer.text(result)
    } else {
      langsContainer.text(await getLanguages(user.country, user.userUUID)) 
    }
  })

  cardHead.append(userImg);
  cardBody.append(userName, userCountry, userAdress, langBtn, langsContainer);
  cardWrap.append(cardHead, cardBody);

  return cardWrap;
}

async function getLanguages(relevantCountry, ID) {
  const country = await getData({url: `https://restcountries.eu/rest/v2/name/${relevantCountry}`})
  const userCountry = country.filter(countryObj => { 
    return countryObj.name.includes(relevantCountry);
  });
  const { languages } = userCountry[0]
  const result = languages.map((langs) => { return langs.name }).join(', ')
  setLocalStorageVal(ID, result)

  return result;
}

function setLocalStorageVal(userUUID, userLangs) {
  const isValueExist = JSON.parse(localStorage.getItem('langs'))
  const langsLsObj = isValueExist ? isValueExist : [];
  const userObj = {}

  userObj[userUUID] = userLangs
  langsLsObj.push(userObj)
  
  localStorage.setItem('langs', JSON.stringify(langsLsObj))
}

function drawNumberOfValues(numberOfUsersArr) {
  const options = numberOfUsersArr.map((val) => {
    const option = $(`<option value='${val}'>${val} Users </option>`);
    return option;
  });

  $("#inputGroupSelect01").append(...options);
}
