const { response } = require("express");
const properties = require("./json/properties.json");
const users = require("./json/users.json");
const { Pool } = require("pg");
const pool = new Pool({
  user: "labber",
  password: "123",
  host: "localhost",
  database: "lightbnb",
});

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function (email) {
  let user = null;

  return new Promise((resolve, reject) => {
    pool
      // Query to retrieve the user's email and password from the users database.
      .query(`SELECT * FROM users WHERE email = $1`, [email])
      .then((response) => {
        // This outputs an ARRAY. Need to specify that we want only the 1st entry, even if we only have ONE result.
        user = response.rows[0];
        if (user !== null) {
          resolve(user);
        } else {
          // If the user is not found. reject and throw null!
          reject(new Error(null));
        }
      })

      // The catch block in the getUserWithEmail function is used to catch any errors that may occur during the execution of the query and reject
      // the promise with the error. This ensures that any errors that occur during the execution of the query are handled properly and not left unhandled,
      // which can cause unexpected behavior in your application.
      .catch((error) => {
        reject(error);
      });
  });
};

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function (id) {
  let user = null;

  return new Promise((resolve, reject) => {
    pool
      // Query to retrieve the user's email and password from the users database.
      .query(`SELECT * FROM users WHERE id = $1`, [id])
      .then((response) => {
        // This outputs an ARRAY. Need to specify that we want only the 1st entry, even if we only have ONE result.
        user = response.rows[0];
        if (user !== null) {
          resolve(user);
        } else {
          // If the user is not found. reject and throw null!
          reject(new Error(null));
        }
      })

      // The catch block in the getUserWithEmail function is used to catch any errors that may occur during the execution of the query and reject
      // the promise with the error. This ensures that any errors that occur during the execution of the query are handled properly and not left unhandled,
      // which can cause unexpected behavior in your application.
      .catch((error) => {
        reject(error);
      });
  });
};

/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = function (user) {
  return new Promise((resolve, reject) => {
    pool
      .query(`INSERT INTO users(name, email, password) VALUES($1,$2,$3)`, [
        user.name,
        user.email,
        user.password,
      ])
      .then((response) => {
        resolve();
      });
  });

  // const userId = Object.keys(users).length + 1;
  // user.id = userId;
  // users[userId] = user;
  // return Promise.resolve(user);
};

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function (guest_id, limit = 10) {
  return getAllProperties(null, 2);
};

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function (options, limit = 10) {
  return pool
    .query(
      `SELECT *
      FROM properties
      LIMIT $1;`,
      [limit]
    )
    .then((result) => {
      return result.rows;
    })
    .catch((err) => {
      console.log(err.message);
    });
  // const limitedProperties = {};
  // for (let i = 1; i <= limit; i++) {
  // limitedProperties[i] = properties[i];
  // }
  // return Promise.resolve(limitedProperties);
};
// getAllProperties();
/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function (property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
};

module.exports = {
  getUserWithEmail,
  getUserWithId,
  addUser,
  getAllReservations,
  getAllProperties,
  addProperty,
};
