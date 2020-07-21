function getUsers (params) {
    const { url, method = "GET" } = params
    return $.ajax({
        url,
        method,
    })
}

const mappingWithFunction = {
    name: { fn: getName, isVisible: true },
    city: { fn: getCity, isVisible: true },
    address: { fn: getAdress, isVisible: true },
    src: { fn: getUserImgUrl, isVisible: true },
}

$(function() {

    $('#usersBtn').on('click', () => {
        const numberOfUsers = $('#inputGroupSelect01 option:selected').val()
        init(numberOfUsers)
    })

    
})

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


async function init (numberOfUsers) {
    try {
        const response = await getUsers({ url: `https://randomuser.me/api/?results=${numberOfUsers}` })
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

