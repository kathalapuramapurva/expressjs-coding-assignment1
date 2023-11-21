const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");
const format = require("date-fns/format");
const isValid = require("date-fns/isValid");

let db = null;
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`Error: '${e.message}'`);
    process.exit(1);
  }
};
initializeDbAndServer();
app.use(express.json());

const isValidStatus = (status) => {
  if (
    status !== undefined &&
    (status === "TO DO" || status === "IN PROGRESS" || status === "DONE")
  ) {
    return true;
  } else {
    response.status(400);
    response.send("Invalid Todo Status");
    return false;
  }
};

const isValidPriority = (priority) => {
  if (
    priority !== undefined &&
    (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW")
  ) {
    return true;
  } else {
    response.status(400);
    response.send("Invalid Todo Priority");
    return false;
  }
};

const isValidCategory = (category) => {
  if (
    category !== undefined &&
    (category === "WORK" || category === "HOME" || category === "LEARNING")
  ) {
    return true;
  } else {
    response.status(400);
    response.send("Invalid Todo Category");
    return false;
  }
};

const requiredAnswer = (each_object) => {
  each_object = each_object.map((each_list) => ({
    id: each_list.id,
    todo: each_list.todo,
    priority: each_list.priority,
    status: each_list.status,
    category: each_list.category,
    dueDate: each_list.due_date,
  }));
  return each_object;
};
//API 1
app.get("/todos/", async (request, response) => {
  const { category, priority, status, search_q = "" } = request.query;
  switch (true) {
    case status !== undefined && priority !== undefined:
      if (isValidStatus(status) && isValidPriority(priority)) {
        const getAllStatusToDoQuery = `
                SELECT *
                FROM todo
                WHERE status = '${status}' and priority = '${priority}';`;
        const statusToDoList = await db.all(getAllStatusToDoQuery);
        response.send(requiredAnswer(statusToDoList));
      }
      break;
    case status !== undefined && category !== undefined:
      if (isValidStatus(status) && isValidCategory(category)) {
        const getAllStatusToDoQuery = `
                SELECT *
                FROM todo
                WHERE status = '${status}' and category = '${category}';`;
        const statusToDoList = await db.all(getAllStatusToDoQuery);
        response.send(requiredAnswer(statusToDoList));
      }
      break;
    case priority !== undefined && category !== undefined:
      if (isValidPriority(priority) && isValidCategory(category)) {
        const getAllStatusToDoQuery = `
                SELECT *
                FROM todo
                WHERE priority = '${priority}' and category = '${category}';`;
        const statusToDoList = await db.all(getAllStatusToDoQuery);
        response.send(requiredAnswer(statusToDoList));
      }
      break;
    case status !== undefined:
      if (isValidStatus(status)) {
        const getAllStatusToDoQuery = `
                SELECT *
                FROM todo
                WHERE status = '${status}';`;
        const statusToDoList = await db.all(getAllStatusToDoQuery);
        response.send(requiredAnswer(statusToDoList));
      }
      break;
    case priority !== undefined:
      if (isValidPriority(priority)) {
        const getAllStatusToDoQuery = `
                SELECT *
                FROM todo
                WHERE priority = '${priority}';`;
        const statusToDoList = await db.all(getAllStatusToDoQuery);
        response.send(requiredAnswer(statusToDoList));
      }
      break;
    case category !== undefined:
      if (isValidCategory(category)) {
        const getAllStatusToDoQuery = `
                SELECT *
                FROM todo
                WHERE category = '${category}';`;
        const statusToDoList = await db.all(getAllStatusToDoQuery);
        response.send(requiredAnswer(statusToDoList));
      }
      break;
    default:
      const getStringPresent = `
            SELECT *
            FROM todo
            WHERE todo LIKE '%${search_q}%';`;
      const allQueries = await db.all(getStringPresent);
      response.send(requiredAnswer(allQueries));
  }
});

//API 2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getSpecificTodoQuery = `
    SELECT *
    FROM todo
    WHERE id = ${todoId};`;
  const specificTodo = await db.get(getSpecificTodoQuery);
  response.send({
    id: specificTodo.id,
    todo: specificTodo.todo,
    priority: specificTodo.priority,
    status: specificTodo.status,
    category: specificTodo.category,
    dueDate: specificTodo.due_date,
  });
});

//API 3
app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  const formattedDate = format(new Date(2021, 01, 22), "yyyy-MM-dd");
  const isValidDate = isValid(new Date(formattedDate));
  if (isValidDate) {
    const getTodoQuery = `
        SELECT *
        FROM todo
        WHERE due_date = '${formattedDate}';`;
    const getTodo = await db.all(getTodoQuery);
    response.send(getTodo);
    response.send({
      id: getTodo.id,
      todo: getTodo.todo,
      priority: getTodo.priority,
      status: getTodo.status,
      category: getTodo.category,
      dueDate: getTodo.due_date,
    });
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

//API 4
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  const createTodoQuery = `
    INSERT INTO 
    todo(id,todo,priority,status,category,due_date)
    VALUES (
        ${id},
        '${todo}',
        '${priority}',
        '${status}',
        '${category}',
        '${dueDate}'
    );`;
  await db.run(createTodoQuery);
  response.send("Todo Successfully Added");
});

//API 5
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let { todo, status, priority, category, dueDate } = request.body;
  const specificTodoQuery = `
    SELECT *
    FROM todo
    WHERE id = ${todoId};`;
  const previous = await db.get(specificTodoQuery);
  let previousTodo = previous["todo"];
  let previousStatus = previous["status"];
  let previousCategory = previous["category"];
  let previousPriority = previous["priority"];
  let previousDue = previous["due_date"];
  //{ todo, status, category, priority, due_date } = ;
  /*  let previousTodo = todo;
  let previousStatus = status;
  let previousCategory = category;
  let previousPriority = priority;
  let previousDue = due_date;
*/

  let updated;
  switch (true) {
    case status !== undefined:
      if (isValidStatus(status)) {
        previousStatus = status;
        updated = "Status";
      }
      break;
    case priority !== undefined:
      if (isValidPriority(priority)) {
        previousPriority = priority;
        updated = "Priority";
      }
      break;
    case category !== undefined:
      if (isValidCategory(category)) {
        previousCategory = category;
        updated = "Category";
      }
      break;
    case todo !== undefined:
      previousTodo = todo;
      updated = "Todo";
      break;
    case dueDate !== undefined:
      if (isValid(new Date(dueDate))) {
        previousDue = dueDate;
        updated = "Due Date";
      }
      break;
  }
  const updateQuery = `
    UPDATE todo
    SET
         todo = '${previousTodo}',
         status = '${previousStatus}',
         category = '${previousCategory}',
         due_date = '${previousDue}'
    WHERE id = ${todoId};
    `;
  await db.run(updateQuery);
  response.send(`${updated} Updated`);
});

//API 6
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteQuery = `
    DELETE FROM todo
    WHERE id = ${todoId};`;
  await db.run(deleteQuery);
  response.send("Todo Deleted");
});

module.exports = app;
