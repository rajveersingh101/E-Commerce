console.clear();
// Update badge if items are present
if (document.cookie.indexOf(',counter=') >= 0) {
    let counter = document.cookie.split(',')[1].split('=')[1];
    document.getElementById("badge").innerHTML = counter;
}

let cartContainer = document.getElementById('cartContainer');
let boxContainerDiv = document.createElement('div');
boxContainerDiv.id = 'boxContainer';
// Create total and button containers
let totalContainerDiv = document.createElement('div');
totalContainerDiv.id = 'totalContainer';
let totalDiv = document.createElement('div');
totalDiv.id = 'total';
totalContainerDiv.appendChild(totalDiv);
let totalh2 = document.createElement('h2');
totalh2.appendChild(document.createTextNode('Total Amount'));
totalDiv.appendChild(totalh2);
let buttonDiv = document.createElement('div');
buttonDiv.id = 'button';
totalDiv.appendChild(buttonDiv);
let buttonTag = document.createElement('button');
buttonDiv.appendChild(buttonTag);
let buttonLink = document.createElement('a');
buttonLink.href = '/orderPlaced.html?';
let buttonText = document.createTextNode('Place Order');
buttonLink.appendChild(buttonText);
buttonTag.appendChild(buttonLink);

// Will be filled after reading cart data
let cartItemsForDataLayer = [];

// Place Order event
buttonTag.onclick = function () {
    console.log("clicked");
    // GTM begin_checkout
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
        event: "begin_checkout",
        ecommerce: {
            items: cartItemsForDataLayer
        }
    });
    // Let the <a> continue to redirect as normal
};

// Dynamic rendering of cart items
function dynamicCartSection(ob, itemCounter) {
    let boxDiv = document.createElement('div');
    boxDiv.id = 'box';
    let boxImg = document.createElement('img');
    boxImg.src = ob.preview;
    boxDiv.appendChild(boxImg);
    let boxh3 = document.createElement('h3');
    boxh3.appendChild(document.createTextNode(ob.name + ' × ' + itemCounter));
    boxDiv.appendChild(boxh3);
    let boxh4 = document.createElement('h4');
    boxh4.appendChild(document.createTextNode('Amount: Rs ' + ob.price * itemCounter));
    boxDiv.appendChild(boxh4);
    boxContainerDiv.appendChild(boxDiv);

    // Add to the cart array for data layer
    cartItemsForDataLayer.push({
        item_id: ob.id,
        item_name: ob.name,
        item_brand: ob.brand,
        price: ob.price,
        quantity: itemCounter,
        item_image: ob.preview
    });
}

// Function to update total amount
function amountUpdate(amount) {
    let totalh4 = document.createElement('h4');
    totalh4.id = 'toth4';
    totalh4.appendChild(document.createTextNode('Amount: Rs ' + amount));
    totalDiv.appendChild(totalh4);
}

// Add all containers to main cart container
cartContainer.appendChild(boxContainerDiv);
cartContainer.appendChild(totalContainerDiv);

// BACKEND CALL to fetch cart product data
let httpRequest = new XMLHttpRequest();
httpRequest.onreadystatechange = function () {
    if (this.readyState === 4) {
        if (this.status == 200) {
            let contentTitle = JSON.parse(this.responseText);
            let counter = Number(document.cookie.split(',')[1].split('=')[1]);
            document.getElementById("totalItem").innerHTML = ('Total Items: ' + counter);
            let item = document.cookie.split(',')[0].split('=')[1].split(" ");
            let totalAmount = 0;

            // Build deduplicated item/quantity pairs for UI and data layer
            for (let i = 0; i < counter; i++) {
                let itemCounter = 1;
                for (let j = i + 1; j < counter; j++) {
                    if (Number(item[j]) == Number(item[i])) {
                        itemCounter += 1;
                    }
                }
                totalAmount += Number(contentTitle[item[i] - 1].price) * itemCounter;
                dynamicCartSection(contentTitle[item[i] - 1], itemCounter);
                i += (itemCounter - 1);
            }
            amountUpdate(totalAmount);

            // GTM view_cart event
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                event: "view_cart",
                ecommerce: {
                    items: cartItemsForDataLayer
                }
            });
        } else {
            console.log('call failed!');
        }
    }
};
httpRequest.open('GET', 'https://5d76bf96515d1a0014085cf9.mockapi.io/product', true);
httpRequest.send();
