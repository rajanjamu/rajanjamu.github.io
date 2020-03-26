var leaveController = (function() {
  var Item = function(id, name, fromDate, toDate, type, reason) {
    this.id = id;
    this.name = name,
    this.fromDate = fromDate,
    this.toDate = toDate,
    this.type = type,
    this.reason = reason
  };

  var data = {
    pnd: [],
    apr: [],
    rej: []
  };

  var formatDate = function(dt) {
    var month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var dateSplit = dt.split('-');
    return dateSplit[2] + ' ' + month[parseInt(dateSplit[1])] + ' ' + dateSplit[0];
  };

  return {
    addItem: function(input, status) {
      var item, ID;

      if (data[status].length > 0) {
        ID = data[status].length + 1;
      } else {
        ID = 1;
      }

      item = new Item(
        ID,
        input.name,
        formatDate(input.fromDate),
        formatDate(input.toDate),
        input.type,
        input.reason
      );
      data[status].push(item);
      return item;
    },

    updateItem: function(status, id, action) {
      var ids, index, newID;

      // Find index of item
      ids = data[status].map(function(curr) {
        return curr.id;
      });
      index = ids.indexOf(id);

      // Add to approve or reject list
      if (data[action].length > 0) {
        newID = data[action].length + 1;
      } else {
        newID = 1;
      }
      data[status][index].id = newID;
      data[action].push(data[status][index]);

      // Remove from pending list
      data[status].splice(index, 1);

      return data[action][data[action].length-1];
    },

    testing: function() {
      return data;
    }
  }

})();

var UIController = (function() {

  DOMstrings = {
    inputName: '.add_name',
    inputFromDate: '.add_from_date',
    inputToDate: '.add_to_date',
    inputType: '.add_type',
    inputReason: '.add_reason',
    inputButton: '.add_btn',
    pndContainer: '.pending_list',
    aprContainer: '.approved_list',
    rejContainer: '.rejected_list',
    aprButton: '.apr_btn',
    rejButton: '.rej_btn',
    container: '.container'
  }

  return {
    getDOMstrings: function() {
      return DOMstrings;
    },

    getInput: function() {
      return {
        name: document.querySelector(DOMstrings.inputName).value,
        fromDate: document.querySelector(DOMstrings.inputFromDate).value,
        toDate: document.querySelector(DOMstrings.inputToDate).value,
        type: document.querySelector(DOMstrings.inputType).value,
        reason: document.querySelector(DOMstrings.inputReason).value
      }
    },

    clearFields: function() {
      var fields, fieldsArr;

        var fields = document.querySelectorAll(
          DOMstrings.inputName + ',' +
          DOMstrings.inputFromDate + ',' +
          DOMstrings.inputToDate + ',' +
          DOMstrings.inputType + ',' +
          DOMstrings.inputReason
        )

        fieldsArr = Array.prototype.slice.call(fields);
        fieldsArr.forEach(function(field) {
          field.value = ''
        });
    },

    addListItem: function(newItem, status) {
      var html, newHtml, element;

      switch(status) {
        case 'pnd': element = DOMstrings.pndContainer; break;
        case 'apr': element = DOMstrings.aprContainer; break;
        case 'rej': element = DOMstrings.rejContainer; break;
      }

      html = '<div class="" id="%status%-%id%"><p>%name%<br>From: %fromDate%<br>To: %toDate%<br>Type: %type%<br>Reason: %reason%<br></p><button type="button" class="apr_btn" name="apr_btn">Apr</button><button type="button" class="rej_btn" name="rej_btn">Rej</button></div>';
      newHtml = html.replace('%status%', status);
      newHtml = newHtml.replace('%id%', newItem.id);
      newHtml = newHtml.replace('%name%', newItem.name);
      newHtml = newHtml.replace('%fromDate%', newItem.fromDate);
      newHtml = newHtml.replace('%toDate%', newItem.toDate);
      newHtml = newHtml.replace('%type%', newItem.type);
      newHtml = newHtml.replace('%reason%', newItem.reason);

      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },

    updateListItem: function(selectorID, newItem, action) {
      var el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);

      this.addListItem(newItem, action);
    }

  }

})();

var appController = (function() {

  var ctrlAddItem = function() {
    // 1. Get inputType
    var input = UIController.getInput();

    // 2. Update data structure
    var newItem = leaveController.addItem(input, 'pnd');

    // 3. Update UI
    UIController.addListItem(newItem, 'pnd');

    // 4. Clear input fields
    UIController.clearFields();
  }

  var ctrlUpdateItem = function(event) {
    var itemID, splitID, status, ID, action, newItem;
    itemID = event.target.parentNode.id;
    action = event.target.className.split('_')[0];

    if (itemID) {
      splitID = itemID.split('-');
      status = splitID[0];
      ID = parseInt(splitID[1]);

      newItem = leaveController.updateItem(status, ID, action);
      UIController.updateListItem(itemID, newItem, action);
    }
  }

  var setupEventListeners = function() {
    DOM = UIController.getDOMstrings();
    document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);
    document.querySelector(DOM.container).addEventListener('click', ctrlUpdateItem);
  }

  return {

    init: function() {
      console.log('Application started!');
      setupEventListeners();
    }

  };
})();

appController.init();
