const { ItemCart } = require("../models/itemCart");

const algoliasearch = require("algoliasearch");
const clientAlgolia = algoliasearch(
  process.env.ALGOLIA_APP_ID,
  process.env.ALGOLIA_ADMIN_ID
);
const index = clientAlgolia.initIndex(process.env.ALGOLIA_INDEX);
async function handleWithItemCart(itemCart, quantity) {
  // item has exist in cart
  // quantity = 0 -> delete
  // mutate quantity
  try {
    if (Number(quantity) === 0) {
      // Delete item from cart
      await ItemCart.findByIdAndDelete(itemCart._id).then((rs) => {
        if (rs) {
          return {
            success: true,
            message: "Item was remove from your cart ��",
          };
        }
      });
    } else {
      // Mutate quantity
      console.log(itemCart);
      itemCart.quantity = Number(quantity);
      itemCart.amount = Number(itemCart.product.price * quantity);

      itemCart.save();
      return {
        success: true,
        message: "Update successful ✅",
      };

      // console.log(item);
    }
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: error.message,
    };
  }
}
async function handleWithProduct(product, quantity, user) {
  // id Product valid
  try {
    //check if product._id exist in user ?cart
    const itemExist = await ItemCart.findOne({
      userId: user._id,
      "product._id": product._id,
    });
    if (itemExist) {
      // exist in cart -> mutate value
      //   console.log(itemCart);
      itemExist.quantity = Number(quantity);
      itemExist.amount = Number(product.price * quantity);

      itemExist.save();
      //   console.log("update");
      return {
        success: true,
        message: "Update successful ✅",
      };
    } else {
      //create new ItemCart then add to cart
      const newItemCart = {
        userId: user._id, //user._id
        product: product,
        quantity: Number(quantity),
        amount: Number(product.price) * Number(quantity),
      };
      //   console.log({ item: newItemCart });
      const itemCart = new ItemCart(newItemCart);
      return await itemCart.save().then((rs) => {
        // console.log(rs);
        user.currentCart = [...user.currentCart, rs];
        user.save();
        // console.log("add");
        return {
          success: true,
          message: "Add successful ✅",
        };
      });
    }
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: error.message,
    };
  }
}

async function checkHasExistInCart(idProduct, cart) {
  let valid = false;
  try {
    cart.forEach((el) => {
      if (el.product._id == idProduct) {
        console.log("product id comp", el.product._id, idProduct);
        valid = true;
      }
    });
    return valid;
  } catch (err) {
    console.log(err);
  }
}
async function checkItemHasExistInCart(idItem, cart) {
  let valid = false;
  try {
    cart.forEach((el) => {
      console.log("product id comp", el._id == idItem);
      if (el._id == idItem) {
        valid = true;
      }
    });
    return valid;
  } catch (err) {
    console.log(err);
  }
}
async function handleProductExistInCart(
  idProduct,
  cart,
  newQuantity,
  productPrice
) {
  try {
    // * Clone array current cart -> mutate
    let oldArr = [...cart];
    oldArr.forEach((el) => {
      if (el.product._id == idProduct) {
        // console.log("product id comp", el.product._id, idProduct);
        el.quantity += newQuantity;
        el.amount += Number(newQuantity * productPrice);
      }
    });
    // console.log(oldArr);
    return oldArr;
  } catch (err) {
    console.log(err);
  }
}
async function handleItemExistInCart(idItem, cart, newQuantity) {
  try {
    // * Clone array current cart -> mutate
    let oldArr = [...cart];
    oldArr.forEach((el) => {
      // console.log("product id comp", el._id == idItem);
      if (el._id == idItem) {
        el.quantity = newQuantity;
        el.amount = Number(newQuantity * el.product.price);
      }
    });
    // console.log({oldArr});
    return oldArr;
  } catch (err) {
    console.log(err);
  }
}

async function handleFilterCart(cart, arrayIdItem) {
  return cart.filter((i) => !arrayIdItem.includes(i._id.toString()));
}
let requestBody = {
  sender_batch_header: {
    recipient_type: "EMAIL",
    email_message: "SDK payouts test txn",
    note: "Enjoy your Payout!!",
    sender_batch_id: "Test_sdk_333",
    email_subject: "This is a test transaction from SDK",
  },
  items: [
    {
      note: "Your 1$ Payout!",
      amount: {
        currency: "USD",
        value: "10.00",
      },
      receiver: "kenprovip2@gmail.com",
      sender_item_id: "Test_txn_1",
    },

    {
      note: "Your 1$ Payout!",
      amount: {
        currency: "USD",
        value: "15.00",
      },
      receiver: "sb-47wy1m6438992@personal.example.com",
      sender_item_id: "Test_txn_3",
    },
  ],
};
function rankSetting(attributes, sortType) {
  //!attributes is an array () )
  const ascAttributes = attributes.join(",");
  if (sortType === "asc") {
    return {
      ranking: [
        `asc(${ascAttributes})`,
        "typo",
        "geo",
        "words",
        "filters",
        "proximity",
        "attribute",
        "exact",
        "custom",
      ],
    };
  } else if (sortType === "desc") {
    return {
      ranking: [
        `desc(${ascAttributes})`,
        "typo",
        "geo",
        "words",
        "filters",
        "proximity",
        "attribute",
        "exact",
        "custom",
      ],
    };
  } else {
    return {
      ranking: [
        "typo",
        "geo",
        "words",
        "filters",
        "proximity",
        "attribute",
        "exact",
        "custom",
      ],
    };
  }
}

function categoriesToQuery(categoriesArr) {
  const query = categoriesArr.map((val) => `"${val}"`).join(" OR categories:");
  return `categories:${query}`;
}
module.exports = {
  index: index,
  testData: requestBody,
  handleItemCart: handleWithItemCart,
  handleProduct: handleWithProduct,
  checkHasExistInCart: checkHasExistInCart,
  handleProductExistInCart: handleProductExistInCart,
  handleItemExistInCart: handleItemExistInCart,
  checkItemHasExistInCart: checkItemHasExistInCart,
  handleFilterCart: handleFilterCart,
  rankSetting: rankSetting,
  categoriesToQuery: categoriesToQuery,
};
