const supportData = {
    moderatorAddresses: {
        development: [
            "TVABvVQKn6MaqXziDaUjW5afg9EcGdGQuX",
            "THC9eiAxFEA9TFv8jLCsoDuLNsa2gCmw6V",
            "TJmXy5Q4jgR6QzB7qmncFoURmVMBB95aL6",
            "TWEE5wJDL2EjR6iryH5mTyebDZWRbPZ733",
        ],

        production: [
            "PMdhZ1gvZXAXmQ6z5ghHz86arfXorxNYgX",
            "PXYhCbTwPaUHrP6spJM5NY84TBpLQJtZi5",
        ],
    },
}

const 
    env = process.env.NODE_ENV,
    moderatorAddresses = supportData.moderatorAddresses[env] || [],
    supportEmail = "support@bastyon.com";

export default {
    moderatorAddresses,
    supportEmail,
};