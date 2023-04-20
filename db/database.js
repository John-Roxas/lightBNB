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
        pool.end(); // close the connection
        resolve();
      })
      .then((response) => {
        pool.end(); // Close the connection even if there's an error!
        reject(error);
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
  return new Promise((resolve, reject) => {
    let userReservations = null;
    pool
      .query(`SELECT * FROM reservations WHERE guest_id = $1 LIMIT $2`, [
        guest_id,
        limit,
      ])
      .then((response) => {
        userReservations = response.rows;
        resolve(userReservations);
      });
  });
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
  // 1
  const queryParams = [];
  // 2
  let queryString = `
  SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_id
  `;

  // 3
  if (options.city) {
    queryParams.push(`%${options.city}%`);
    queryString += `WHERE city LIKE $${queryParams.length} `;
  }

  if (options.owner_id) {
    queryParams.push(options.owner_id);
    if (queryParams.length > 1) {
      queryString += `AND owner_id = $${queryParams.length} `;
    } else {
      queryString += `WHERE owner_id = $${queryParams.length} `;
    }
  }

  if (options.minimum_price_per_night) {
    queryParams.push(options.minimum_price_per_night);
    if (queryParams.length > 1) {
      queryString += `AND cost_per_night >= $${queryParams.length} `;
    } else {
      queryString += `WHERE cost_per_night >= $${queryParams.length} `;
    }
  }

  if (options.maximum_price_per_night) {
    queryParams.push(options.maximum_price_per_night);
    if (queryParams.length > 1) {
      queryString += `AND cost_per_night <= $${queryParams.length} `;
    } else {
      queryString += `WHERE cost_per_night <= $${queryParams.length} `;
    }
  }

  if (options.minimum_rating) {
    queryParams.push(options.minimum_rating);
    queryString += `
      GROUP BY properties.id
      HAVING avg(property_reviews.rating) >= $${queryParams.length}
    `;
  } else {
    // Step 8: If no minimum rating, just group by property ID
    queryString += `GROUP BY properties.id`;
  }

  queryParams.push(limit);
  queryString += `
    ORDER BY cost_per_night
    LIMIT $${queryParams.length};
  `;

  // 6
  return pool.query(queryString, queryParams).then((res) => res.rows);
};
// getAllProperties();
/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = async function (property) {
  console.log(property);
  // Define the SQL query with placeholders for the property values
  const query = {
    text: `
      INSERT INTO properties (
        owner_id,
        title,
        description,
        thumbnail_photo_url,
        cover_photo_url,
        cost_per_night,
        street,
        city,
        province,
        post_code,
        country,
        parking_spaces,
        number_of_bathrooms,
        number_of_bedrooms
      ) VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10,
        $11,
        $12,
        $13,
        $14
      ) RETURNING id;
    `,
    values: [
      property.owner_id,
      property.title,
      property.description,
      property.thumbnail_photo_url,
      property.cover_photo_url,
      property.cost_per_night,
      property.street,
      property.city,
      property.province,
      property.post_code,
      property.country,
      property.parking_spaces,
      property.number_of_bathrooms,
      property.number_of_bedrooms,
    ],
  };

  try {
    const result = await pool.query(query);
    property.id = result.rows[0].id;
    return Promise.resolve(property);
  } catch (err) {
    return Promise.reject(err);
  }
};

module.exports = {
  getUserWithEmail,
  getUserWithId,
  addUser,
  getAllReservations,
  getAllProperties,
  addProperty,
};
