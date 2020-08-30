const budgetController = (() => {
  const Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  const Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  calculateTotal = (type) => {
    let sum = 0;
    data.allItems[type].forEach((cur) => {
      sum += cur.value;
    });
    data.totals[type] = sum;
  };
  let data = {
    allItems: {
      exp: [],
      inc: [],
    },
    totals: {
      exp: 0,
      inc: 0,
    },
    budget: 0,
  };

  return {
    addItem: (type, des, val) => {
      let newItem, ID;

      // create new ID
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id = 1;
      } else {
        ID = 0;
      }

      //create a new ITEM based on type
      if (type === "exp") {
        newItem = new Expense(ID, des, val);
      } else if (type === "inc") {
        newItem = new Income(ID, des, val);
      }
      // push it into the data structure
      data.allItems[type].push(newItem);

      //return the new element
      return newItem;
    },

    deleteItem: (type, id) => {
      let ids, index;
      ids = data.allItems[type].map((current) => {
        return current.id;
      });
      index = ids.indexOf(id);

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    calculateBudget: () => {
      //calculate total income and expenses
      calculateTotal("exp");
      calculateTotal("inc");

      //calculate the budget: income - expenses
      data.budget = data.totals.inc - data.totals.exp;
    },
    getBudget: () => {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
      };
    },
  };
})();

//UI CONTROLLER
const UIController = (function () {
  const DOMStrings = {
    inputType: ".add-type",
    inputDescription: ".add-description",
    inputValue: ".add-value",
    inputBtn: ".add-btn ",
    incomeContainer: ".income-list",
    expensesContainer: ".expenses-list",
    budgetLabel: ".budget-value",
    incomeLabel: ".budget-income-value",
    expensesLabel: ".budget-expenses-value",
    container: ".container-main",
    dateLabel: ".budget-title-month",
  };
  return {
    getInput: () => {
      return {
        type: document.querySelector(DOMStrings.inputType).value, // will be either inc or exp
        description: document.querySelector(DOMStrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMStrings.inputValue).value),
      };
    },
    addListItem: (obj, type) => {
      let html, newHtml, element;
      //create HMTL string
      if (type === "inc") {
        element = DOMStrings.incomeContainer;
        html =
          '<div class="item clearfix" id="inc-%id%"> <div class="item-description">%description%</div> <div class="right clearfix"> <div class="item-value">%value%</div> <div class="item-delete"> <button class="item-delete-btn"> <i class="fas fa-minus"></i> </button></div> </div> </div>';
      } else if (type === "exp") {
        element = DOMStrings.expensesContainer;
        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item-description">%description%</div> <div class="right clearfix"> <div class="item-value">%value%</div> <div class="item-delete"> <button class="item-delete-btn"><i class="fas fa-minus"></i></button> </div> </div> </div> </div>';
      }
      // replace the placeholder text with the data from the Object
      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", obj.value);
      //insert the HTML into DOM
      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },

    deleteListItem: (selectorID) => {
      let el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },

    clearFields: () => {
      let fields = document.querySelectorAll(
        DOMStrings.inputDescription + "," + DOMStrings.inputValue
      );

      let fieldsArr = Array.prototype.slice.call(fields);

      fieldsArr.forEach((current, index, array) => {
        current.value = "";
      });
      fieldsArr[0].focus();
    },
    displayBudget: (obj) => {
      document.querySelector(DOMStrings.budgetLabel).textContent = obj.budget;
      document.querySelector(DOMStrings.incomeLabel).textContent = obj.totalInc;
      document.querySelector(DOMStrings.expensesLabel).textContent = obj.totalExp;
    },
    displayMonth: () => {
      let now, year, month, months;
      now = new Date();
      months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      month = now.getMonth();
      year = now.getFullYear();
      document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ", " + year;
    },

    getDOMStrings: () => {
      return DOMStrings;
    },
  };
})();

//GLOBAL APP CONTROLLER

const controller = (function (budgetCtrl, UICtrl) {
  setupEventListeners = () => {
    let DOM = UICtrl.getDOMStrings();
    document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);

    document.addEventListener("keypress", (event) => {
      if (event.keycode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });
    document.querySelector(DOM.container).addEventListener("click", ctrlDeleteItem);
  };
  updateBudget = () => {
    //Calculate Budget
    budgetCtrl.calculateBudget();
    //Return the budget
    let budget = budgetCtrl.getBudget();
    //display in the UI budget
    UICtrl.displayBudget(budget);
  };
  ctrlAddItem = () => {
    // Get the field input data
    let input = UICtrl.getInput();

    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      let newItem = budgetCtrl.addItem(input.type, input.description, input.value);

      // add the item to the UI

      UICtrl.addListItem(newItem, input.type);
      //clear fields
      UICtrl.clearFields();
      //calculate the budget
      updateBudget();
    }
  };

  ctrlDeleteItem = (event) => {
    let itemID, splitID, type, ID;

    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {
      splitID = itemID.split("-");
      type = splitID[0];
      ID = parseInt(splitID[1]);

      // delete the item from the data sctructure
      budgetCtrl.deleteItem(type, ID);
      //delete the item from UI
      UICtrl.deleteListItem(itemID);
      //update budget
      updateBudget();
    }
  };

  return {
    init: () => {
      console.log("App is initiateted!");
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
      });
      setupEventListeners();
    },
  };
})(budgetController, UIController);

controller.init();
