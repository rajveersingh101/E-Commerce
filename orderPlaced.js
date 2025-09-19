// First, get cart data from cookies (same logic as your cart)
let productsURL = "https://5d76bf96515d1a0014085cf9.mockapi.io/product";
let orderURL = "https://5d76bf96515d1a0014085cf9.mockapi.io/order";

// Utility to get deduplicated item/quantity pairs
function getCartItems(contentTitle) {
    let counter = Number(document.cookie.split(',')[1].split('=')[1]);
    let item = document.cookie.split(',')[0].split('=')[1].split(" ");
    let itemsArr = [];
    for (let i = 0; i < counter; i++) {
        let itemCounter = 1;
        for (let j = i + 1; j < counter; j++) {
            if (Number(item[j]) == Number(item[i])) {
                itemCounter += 1;
            }
        }
        let prod = contentTitle[item[i] - 1];
        itemsArr.push({
            item_id: prod.id,
            item_name: prod.name,
            item_brand: prod.brand,
            price: prod.price,
            quantity: itemCounter,
            item_image: prod.preview
        });
        i += (itemCounter - 1);
    }
    return itemsArr;
}

// Fetch product info, then fire purchase event and POST to order API
let httpRequest = new XMLHttpRequest();
httpRequest.open("GET", productsURL, true);
httpRequest.onreadystatechange = function () {
    if (httpRequest.readyState == 4 && httpRequest.status == 200) {
        let contentTitle = JSON.parse(httpRequest.responseText);
        // Build items/amount for order and GTM
        let orderItems = getCartItems(contentTitle);
        let totalAmount = orderItems.reduce((sum, prod) => sum + (prod.price * prod.quantity), 0);

        // Send order to order API as before
        let postRequest = new XMLHttpRequest();
        postRequest.open("POST", orderURL, true);
        postRequest.setRequestHeader("Content-Type", "application/json");
        let orderPayload = JSON.stringify({
            id: Date.now(), // Or use your logic for order id
            amount: totalAmount,
            product: orderItems.map(x => x.item_id)
        });
        postRequest.send(orderPayload);

        // Fire GTM purchase event with dynamic cart
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            event: "purchase",
            ecommerce: {
                transaction_id: Date.now(),        // Replace with real order id if available
                value: totalAmount,
                currency: "INR",
                items: orderItems
            }
        });

        // Optionally clear the cart here (reset cookie):
        document.cookie = "orderId=0,counter=0";
    }
};
httpRequest.send(null);
