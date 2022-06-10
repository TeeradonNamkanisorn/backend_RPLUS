const createError = require('../utils/createError');
const omise = require('../utils/omise');



module.exports.createCharge = async ({user, amountInCents, token}) => {
    if (!user.email) createError("expect user email")
    if (!user.firstNamel) createError("expect first name")
    if (!user.lastName) createError("expect lastname")
    if (!token) createError("expect omise token");
    if (!amountInCents) createError('expect amount in cents')
    const customer = await omise.customers.create({
        email: user.email,
        description: user.firstName + user.lastName,
        card: token
    })
    console.log(customer);
    const charge = await omise.charges.create({
        'amount': amountInCents,
        currency: "usd",
        customer: customer.id
    })

    console.log("charge------->", charge)
    
}