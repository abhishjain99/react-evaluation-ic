// public/index.js
const API = (() => {
  const URL = "http://localhost:3000";
  const getCart = async() => {
    // define your method to get cart data
    const cartResponse = await fetch(`${URL}/cart`);
    return cartResponse.json();
  };

  const getInventory = async() => {
    // define your method to get inventory data
    const inventoryResponse = await fetch(`${URL}/inventory`);
    return inventoryResponse.json();
  };

  const addToCart = async(inventoryItem) => {
    // define your method to add an item to cart
    const addResponse = await fetch(`${URL}/cart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...inventoryItem, amount: 1 }),
    });
    return addResponse.json();
  };

  const updateCart = async(id, newAmount) => {
    // define your method to update an item in cart
    const updateResponse = await fetch(`${URL}/cart/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount: newAmount }),
    });
    return updateResponse.json();
  };

  const deleteFromCart = async(id) => {
    // define your method to delete an item in cart
    const deleteResponse = await fetch(`${URL}/cart/${id}`, {
      method: "DELETE",
    });
    return deleteResponse.json();
  };

  const checkout = async() => {
    // you don't need to add anything here
    return getCart().then((data) =>
      Promise.all(data.map((item) => deleteFromCart(item.id)))
    );
  };

  return {
    getCart,
    updateCart,
    getInventory,
    addToCart,
    deleteFromCart,
    checkout,
  };
})();

const Model = (() => {
  // implement your logic for Model
  class State {
    #onChange;
    #inventory;
    #cart;
    constructor() {
      this.#inventory = [];
      this.#cart = [];
      this.#onChange = () => {};
    }
    get cart() {
      return this.#cart;
    }

    get inventory() {
      return this.#inventory;
    }

    set cart(newCart) {
      this.#cart = newCart;
      this.#onChange(this.#cart);
    }
    set inventory(newInventory) {
      this.#inventory = newInventory;
      this.#onChange(this.#inventory);
    }

    subscribe(cb) {
      this.#onChange = cb;
    }
  }
  const {
    getCart,
    updateCart,
    getInventory,
    addToCart,
    deleteFromCart,
    checkout,
  } = API;
  return {
    State,
    getCart,
    updateCart,
    getInventory,
    addToCart,
    deleteFromCart,
    checkout,
  };
})();

const View = (() => {
  // implement your logic for View
  const inventoryList = document.querySelector(".inventory-container ul");
  const cartList = document.querySelector(".cart-container ul");
  const checkoutBtn = document.querySelector(".checkout-btn");

  const renderInventory = (inventory) => {
    inventoryList.innerHTML = "";
    inventory.forEach((item) => {
      console.log('inv', item);
      var inventoryItem = document.createElement("li");
      inventoryItem.innerHTML = `
        <span class="item-content">${item.content}</span>
        <div class="item-controls">
          <button class="btn btn-minus" data-id="minus_${item.id}">-</button>
          <span class="item-amount" data-id="amount_${item.id}" value="0"> 0 </span>
          <button class="btn btn-plus" data-id="plus_${item.id}">+</button>
          <button class="btn btn-info" data-id="add_${item.id}" id= "add_${item.id}">add to cart</button>
        </div>
      `;
      inventoryList.appendChild(inventoryItem);
    });
  };

  const renderCart = (cart) => {
    cartList.innerHTML = "";
    cart.forEach(item => {
      console.log('cart', item);
      var cartItem = document.createElement("li");
      cartItem.innerHTML = `
        <span class="item-content">${item.content} x ${item.amount}</span>
        <button class="btn btn-delete" data-id="${item.id}" id= "del_${item.id}">delete</button>
      `;
      cartList.appendChild(cartItem);
    })
  };

  return {
    renderInventory,
    renderCart,
  };
})();

const Controller = ((model, view) => {
  // implement your logic for Controller
  const state = new model.State();

  const init = async () => {
    await model.getInventory().then((inventory) => View.renderInventory(inventory));
    await model.getCart().then((cart) => View.renderCart(cart));
    state.subscribe(View.renderCart);
  };
  const handleUpdateAmount = () => {};

  const handleAddToCart = () => {};

  const handleDelete = () => {};

  const handleCheckout = () => {};
  const bootstrap = () => {
    init()
  };
  return {
    bootstrap,
  };
})(Model, View);

Controller.bootstrap();
