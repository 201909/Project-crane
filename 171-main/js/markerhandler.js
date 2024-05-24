var uid = null;
AFRAME.registerComponent("markerhandler", {
  init: async function() {
    var toyss = await this.gettoyss();

    if (uid === null) {
      this.askUserId();
    }

    this.el.addEventListener("markerFound", () => {
//add condition to check when uid is not equal to null
if(uid !== null)
      {

        var markerId = this.el.id;
        this.handleMarkerFound(toyss, markerId);
      }
    });

    this.el.addEventListener("markerLost", () => {
      this.handleMarkerLost();
    });
  },
  askUserId: function() {
    var iconUrl =
      "https://raw.githubusercontent.com/whitehatjr/ar-toys-store-assets/master/toys-shop.png";

    swal({
      title: "Welcome to toys Shop!!",
      icon: iconUrl,
      content: {
        element: "input",
        attributes: {
          placeholder: "Type your uid Ex:( U01 )"
        }
      }
    }).then(inputValue => {
      uid = inputValue;
    });
  },
  handleMarkerFound: function(toyss, markerId) {
    var toys = toyss.filter(toys => toys.id === markerId)[0];

    if (toys.is_out_of_stock) {
      swal({
        icon: "warning",
        title: toys.toys_name.toUpperCase(),
        text: "This toys is out of stock!!!",
        timer: 2500,
        buttons: false
      });
    } else {
      // Changing Model scale to initial scale
      var model = document.querySelector(`#model-${toys.id}`);
      model.setAttribute("position", toys.model_geometry.position);
      model.setAttribute("rotation", toys.model_geometry.rotation);
      model.setAttribute("scale", toys.model_geometry.scale);

      // make model visible
      var model = document.querySelector(`#model-${toys.id}`);
      model.setAttribute("visible", true);

      // make mian plane Container visible
      var mainPlane = document.querySelector(`#main-plane-${toys.id}`);
      mainPlane.setAttribute("visible", true);

      // Changing button div visibility
      var buttonDiv = document.getElementById("button-div");
      buttonDiv.style.display = "flex";

      var orderButtton = document.getElementById("order-button");
      var orderSummaryButtton = document.getElementById("order-summary-button");

      // Handling Click Events
      orderButtton.addEventListener("click", () => {
        uid = uid.toUpperCase();
        this.handleOrder(uid, toys);

        swal({
          icon: "https://i.imgur.com/4NZ6uLY.jpg",
          title: "Thanks For Order !",
          text: "  ",
          timer: 2000,
          buttons: false
        });
      });

      orderSummaryButtton.addEventListener("click", () => {
        swal({
          icon: "warning",
          title: "Order Summary",
          text: "Work In Progress"
        });
      });
    }
  },
  handleOrder: function(uid, toys) {
    // Reading current UID order details
    firebase
      .firestore()
      .collection("users")
      .doc(uid)
      .get()
      .then(doc => {
        var details = doc.data();

        if (details["current_orders"][toys.id]) {
          // Increasing Current Quantity
          details["current_orders"][toys.id]["quantity"] += 1;

          //Calculating Subtotal of item
          var currentQuantity = details["current_orders"][toys.id]["quantity"];

          details["current_orders"][toys.id]["subtotal"] =
            currentQuantity * toys.price;
        } else {
          details["current_orders"][toys.id] = {
          //update the fields in database
      
            item: toys.toys_name,
            quantity: 1,



          
          };
        }

        details.total_bill += toys.price;

        // add the code to update the order details in database
        firebase
        .firestore()
        .collection("toys")
        .doc(doc.id)
        .update(details);






      });
  },
  gettoyss: async function() {
    return await firebase
      .firestore()
      .collection("toyss")
      .get()
      .then(snap => {
        return snap.docs.map(doc => doc.data());
      });
  },
  handleMarkerLost: function() {
    // Changing button div visibility
    var buttonDiv = document.getElementById("button-div");
    buttonDiv.style.display = "none";
  }
});
