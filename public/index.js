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
    }
    get cart() {
      return this.#cart;
    }

    get inventory() {
      return this.#inventory;
    }

    set cart(newCart) {}
    set inventory(newInventory) {}

    subscribe(cb) {}
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
  return {};
})();

const Controller = ((model, view) => {
  // implement your logic for Controller
  const state = new model.State();

  const init = () => {};
  const handleUpdateAmount = () => {};

  const handleAddToCart = () => {};

  const handleDelete = () => {};

  const handleCheckout = () => {};
  const bootstrap = () => {};
  return {
    bootstrap,
  };
})(Model, View);

Controller.bootstrap();
