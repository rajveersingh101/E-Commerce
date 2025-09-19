let contentTitle;
console.log(document.cookie);

function dynamicClothingSection(ob) {
  let boxDiv = document.createElement("div");
  boxDiv.id = "box";

  let boxLink = document.createElement("a");
  boxLink.href = "/contentDetails.html?" + ob.id;

  // Add event listener directly to the anchor:
  boxLink.addEventListener("click", function () {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'select_item',
      ecommerce: {
        items: [{
          item_id: ob.id || '',         // Product ID
          item_name: ob.name || '',     // Product Name
          item_brand: ob.brand || '',   // Brand
          price: ob.price || '',        // Price
          item_image: ob.preview || ''  // Main image
        }]
      }
    });
  });

  let imgTag = document.createElement("img");
  imgTag.src = ob.preview;

  let detailsDiv = document.createElement("div");
  detailsDiv.id = "details";
  let h3 = document.createElement("h3");
  h3.appendChild(document.createTextNode(ob.name));
  let h4 = document.createElement("h4");
  h4.appendChild(document.createTextNode(ob.brand));
  let h2 = document.createElement("h2");
  h2.appendChild(document.createTextNode("rs  " + ob.price));
  boxDiv.appendChild(boxLink);
  boxLink.appendChild(imgTag);
  boxLink.appendChild(detailsDiv);
  detailsDiv.appendChild(h3);
  detailsDiv.appendChild(h4);
  detailsDiv.appendChild(h2);
  return boxDiv;
}

let mainContainer = document.getElementById("mainContainer");
let containerClothing = document.getElementById("containerClothing");
let containerAccessories = document.getElementById("containerAccessories");

let httpRequest = new XMLHttpRequest();
httpRequest.onreadystatechange = function() {
  if (this.readyState === 4) {
    if (this.status == 200) {
      contentTitle = JSON.parse(this.responseText);
      if (document.cookie.indexOf(",counter=") >= 0) {
        var counter = document.cookie.split(",")[1].split("=")[1];
        document.getElementById("badge").innerHTML = counter;
      }
      for (let i = 0; i < contentTitle.length; i++) {
        if (contentTitle[i].isAccessory) {
          containerAccessories.appendChild(
            dynamicClothingSection(contentTitle[i])
          );
        } else {
          containerClothing.appendChild(
            dynamicClothingSection(contentTitle[i])
          );
        }
      }
    } else {
      console.log("call failed!");
    }
  }
};
httpRequest.open(
  "GET",
  "https://5d76bf96515d1a0014085cf9.mockapi.io/product",
  true
);
httpRequest.send();
