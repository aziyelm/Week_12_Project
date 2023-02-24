/*
Coding Steps:
-Create a full CRUD application of your choice using an API 
-Use an existing API with AJAX to interact with it. 
-Use a form to post new entities.
-Build a way for users to update or delete entities
-Use Bootstrap and CSS to style your project.
*/

/*Sushi App: User signs in by entering a name into a form and 
ordering food by inputting the item & quanitity
*/

let orderIder = 1;

//CLASSES
class Table {
  constructor(name) {
    this.name = name;
    this.orders = []; //array of orders
  }

  //method to add order to orders[]
  addOrder(item, quantity) {
    this.orders.push(new Order(item, quantity));
  }
}

class Order {
  constructor(item, quantity) {
    this.item = item;
    this.quantity = quantity;
    this._id = orderIder++; //iterate for new id 
  }
}
//SERVICE CLASS: sends the HTTP/AJAX requests to the API (to be used in the DOM manager class below)
class TableService {
  static url =
    "https://63f6a57559c944921f7768c9.mockapi.io/Sushi_App/sushi"; //MockAPI url 

//METHODS: CRUD (Create, Read, Update, Delete) REQUESTS
  //READ: GET REQUEST  
  static getAllTables() {
    return $.get(this.url);
  }

  static getTable() {
    return $.get(this.url + `/${id}`);
  }

  //CREATE: POST REQUEST
  static createTable(table) { //table = instance of the Table class
    return $.post(this.url, table);
  }

  //UPDATE: PUT REQUEST
  static updateTable(table) {
    return $.ajax({
      url: this.url + `/${table._id}`,
      dataType: "json",
      data: JSON.stringify(table),
      contentType: "application/json",
      type: "PUT",
    });
  }

  //DELETE: DELETE REQUEST
  static deleteTable(id) {
    return $.ajax({
      url: this.url + `/${id}`,
      type: "DELETE",
    });
  }
}

//DOM MANAGER CLASS: Rerender (see render method) the DOM each time the app div is updated
class DOMManager {
  static tables;

  //METHODS
  static getAllTables() {
    TableService.getAllTables().then((tables) => this.render(tables));
  }

  static createTable(table) {
    TableService.createTable(new Table(table))
      .then(() => {
        return TableService.getAllTables();
      })
      .then((tables) => this.render(tables));
  }

  static deleteTable(id) {
    TableService.deleteTable(id)
      .then(() => {
        return TableService.getAllTables();
      })
      .then((tables) => this.render(tables));
  }

  static addOrder(id) {
    for (let table of this.tables) {
      if (table._id == id) {
        table.orders.push(new Order(
          $(`#${table._id}-order-item`).val(),
          $(`#${table._id}-order-quantity`).val()
        )
        );
        TableService.updateTable(table)
          .then(() => {
            return TableService.getAllTables();
          })
          .then((tables) => this.render(tables));
      }
    }
  }

  static deleteOrder(tableId, orderId) {
    for (let table of this.tables) {
      if (table._id == tableId) {
        for (let order of table.orders) {
          if (order._id == orderId) {
            table.orders.splice( //splice to delete
              table.orders.indexOf(table),1);
            TableService.updateTable(table)
              .then(() => {
                return TableService.getAllTables();
              })
              .then((tables) => this.render(tables));
          }
        }
      }
    }
  }
  
  //method to take a list of tables and renders it to the DOM
  static render(tables) {
    this.tables = tables;
    $("#app").empty(); //empty out app div
    for (let table of tables) {
      /* HTML prepended to add/delete a table and add an order 
      delete table button, form to input item/quantity, and an add order button */
        $("#app").prepend(
            `<div id="${table._id}" class="card">
                <div class="card-header">
                    <h3>${table.name}</h3>
                    <button class="btn btn-danger" 
                    onclick="DOMManager.deleteTable('${table._id}')">Delete</button>
                </div>
                <div class="card-body">
                    <div class="card">
                        <div class="row">
                            <div class="col-sm">
                                <input type="text" id="${table._id}-order-item"
                                class="form-control" placeholder="Item">
                            </div>
                            <div class="col-sm">
                                <input type="text" id="${table._id}-order-quantity"
                                class="form-control" placeholder="Quantity">
                            </div>
                        </div>
                        <button id="${table._id}-add-order" onclick="DOMManager.addOrder('${table._id}')" class="btn btn-success form-control">Add Order</button>
                    </div>
                </div><br>`
      );
      for (let order of table.orders) {
        $(`#${table._id}`)
          .find(".card-body")
          .append(
            //HTML appended to add an order to the top of the table or delete an order
            `<p>
                <span id="item-${order._id}"><strong>Item: </strong> ${order.item}</span>
                <span id="quantity-${order._id}"><strong>Quantity: </strong> ${order.quantity}</span>
                <button class="btn btn-warning" onclick="DOMManager.deleteOrder
                ('${table._id}','${order._id}')">Remove Order</button>
            </p>
            `
          );
      }
    }
  }
}

//clear input fields after adding a new table
$("#create-new-table").on("click", () => {
  DOMManager.createTable($("#new-table-name").val());
  $("#new-table-name").val("");
});

//RUN APP
DOMManager.getAllTables();