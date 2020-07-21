function getUsers (params) {
    const { url, method = "GET" } = params
    return $.ajax({
        url,
        method,
    })
}


// const mapping = {
//     name: { fn: getName, isVisible: true },
//     city: { path: "location.city", isVisible: true },
//     address: { path: "location.street.name", isVisible: true },
//     src: { path: "picture.large", isVisible: true },

// }

const mappingWithFunction = {
    name: { fn: getName, isVisible: true },
    city: { fn: getCity, isVisible: true },
    address: { fn: getAdress, isVisible: true },
    src: { fn: getUserImgUrl, isVisible: true },
}

function getName (user) {
    return `${user.name.first} ${user.name.last}`
}
function getCity (user) {
    return user.location.city
}
function getAdress (user) {
    return `${user.location.street.name} ${user.location.street.number}`
}
function getUserImgUrl (user) {
    return user.picture.medium
}


async function init () {
    try {
        const response = await getUsers({ url: "https://randomuser.me/api/?results=10" })
        const { results } = response
        console.log(results) // DRAW HERE
        draw(results)
    } catch (err) {
        console.log(err)
        console.error(`message: ${err.statusText} , status: ${err.status}`)
    }
}

function draw (arrOfObjects) {
    const mappedUsers = arrOfObjects.map((user) => {
        return getMappedUser(user)
    })

    console.log(mappedUsers)
    //DRAW
}

function getMappedUser (user) {
    const keyValueMappingArray = Object.entries(mappingWithFunction)

    return keyValueMappingArray.reduce((mappedUser, KEYVALUEPAIR_ARRAY,) => {
        const [ key, settingObj ] = KEYVALUEPAIR_ARRAY
        const { path } = settingObj
        const isFunction = typeof settingObj[ "fn" ] === 'function';
        return { ...mappedUser, [ key ]: isFunction ? settingObj[ "fn" ](user) : getValueFromPath(path, user) }
    }, {})
}



// function getValueFromPath (path, user) {
//     if (typeof path !== 'string') return
//     const splittedPath = path.split(".")
//     const theRequestedValue = splittedPath.reduce((currentUser, partOfPath) => {
//         const isValueExist = currentUser[ partOfPath ]
//         return isValueExist ? currentUser[ partOfPath ] : "Not Availble"
//     }, user)
//     return theRequestedValue
// }


(function () {
    init()
})()