var express = require("express");
var router = express.Router();
const bcrypt = require("bcrypt");
const Driver = require("../models/driver.model");
const Student = require("../models/student.model");
const Parent = require("../models/parent.model");
const Van = require("../models/van.model");
const Fee = require("../models/fee.model");
const Route = require("../models/route.model");
const Complaint = require("../models/complaint.model");
const Admin = require("../models/admin.model");
const auth = require("../authentication/admin.authenticate");
const _ = require("lodash");

//Profile
router.get("/", auth.verifyJwtToken, function (req, res, next) {
  Admin.findById(req._id)
    .then((admin) => {
      return res.status(200).json({ status: true, user: admin });
    })
    .catch((err) => {
      res.status(500).send("Unable to find the profile details");
    });
});

/* Add Admin */
router.post("/addadmin", auth.verifyJwtToken, function (req, res, next) {
  var fullName = req.body.fullname;
  var email = req.body.email;
  var phone_no = req.body.phone_no;
  var cnic = req.body.cnic;
  var role = "admin";
  var password = req.body.password;
  bcrypt.hash(password, 10, function (err, hash) {
    if (err) {
      res.send("Something went wrong! Try Again");
    } else {
      var admin = new Admin({
        fullname: fullName,
        email,
        phone_no,
        cnic,
        role,
        password: hash,
      });
      admin
        .save()
        .then((doc) => {
          res.status(201).send("Admin Registered Successfully!");
        })
        .catch((err) => {
          res.send(err);
        });
    }
  });
});

/* GET all students. */
router.get("/students", auth.verifyJwtToken, function (req, res, next) {
  Student.find()
    .sort("fullname")
    .exec(function (error, results) {
      if (error) {
        res.send({ status: 500, message: "Unable to find students" });
      } else {
        const recordCount = results.length;
        res.status(200).send({ recordCount: recordCount, results: results });
      }
    });
});

/* GET specific student. */
router.get("/students/:id", auth.verifyJwtToken, function (req, res, next) {
  Student.findById(req.params.id)
    .then((student) => {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.json(student);
    })
    .catch((err) => {
      res.status(500).send("Unable to find the student");
    });
});

/* GET all available students. */
router.get(
  "/availablestudents",
  auth.verifyJwtToken,
  function (req, res, next) {
    Student.find({ assignedDriver: null })
      .sort("fullname")
      .exec(function (error, results) {
        if (error) {
          next(error);
        } else {
          const recordCount = results.length;
          res.status(200).send({ recordCount: recordCount, results: results });
        }
      });
  }
);

/* CREATE new Student. */
router.post("/addstudent", auth.verifyJwtToken, function (req, res, next) {
  var fullName = req.body.fullname;
  var email = req.body.email;
  var phone_no = req.body.phone_no;
  var schoolAdress = req.body.schoolAdress;
  var homeAdress = req.body.homeAdress;
  var age = req.body.age;
  var gender = req.body.gender;
  var role = "student";
  var password = req.body.password;
  bcrypt.hash(password, 10, function (err, hash) {
    if (err) {
      res.send("Something went wrong! Try Again");
    } else {
      var student = new Student({
        fullname: fullName,
        email,
        phone_no,
        schoolAdress,
        homeAdress,
        age,
        gender,
        role,
        password: hash,
      });
      student
        .save()
        .then((doc) => {
          res.status(201).send("Student Registered Successfully!");
        })
        .catch((err) => {
          res.send(err);
        });
    }
  });
});

/* UPDATE student */
router.patch(
  "/updatestudent/:id",
  auth.verifyJwtToken,
  async (req, res, next) => {
    try {
      const _id = req.params.id;
      const student = await Student.findById({ _id });
      if (!student) {
        res.send("Student does not exists");
      } else {
        const updatedStudent = await Student.findByIdAndUpdate(_id, req.body, {
          new: true,
        });
        res.status(200).send({
          messaage: "Following student has been updated successfully",
          result: updatedStudent,
        });
      }
    } catch (e) {
      next(e);
    }
  }
);

//Delete Student
router.delete(
  "/deletestudent/:id",
  auth.verifyJwtToken,
  async function (req, res, next) {
    try {
      const _id = req.params.id;
      const student = await Student.findById({ _id });
      if (!student) {
        res.status(404).send("Student does not exists");
        return;
      }
      Student.deleteOne({ _id: req.params.id }, function (error, results) {
        if (error) {
          next(error);
        } else res.status(201).send({ message: "Following student has been deleted successfully", result: results });
      });
    } catch (e) {
      next(e);
    }
  }
);

/* Assign Student to Driver */
router.patch(
  "/assign/:sid/driver/:did",
  auth.verifyJwtToken,
  async function (req, res, next) {
    try {
      const student = await Student.findById({ _id: req.params.sid });
      if (!student) {
        res.status(404).send("Student does not exists");
        return;
      }
      const driver = await Driver.findById({ _id: req.params.did });
      if (!driver) {
        res.status(404).send("Driver does not exists");
        return;
      }
      student.updateOne({ assignedDriver: driver }, (error, updatedStudent) => {
        if (error) {
          next(error);
        } else {
          res.status(200).send({
            messaage: "Student has been assigned a driver successfully!",
            result: updatedStudent,
          });
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

//view Assiged van to a student
router.get(
  "/assignedvantostudent/:sid",
  auth.verifyJwtToken,
  function (req, res, next) {
    Student.findOne({ _id: req.params.sid }).exec(function (error, results) {
      if (error) {
        res.status(500).send({ message: "Something went wrong" });
      } else {
        if (results.length == 0) {
          res.status(404).send({ message: "Student does not exist" });
          return;
        } else {
          if (results.assignedDriver) {
            Driver.findById({ _id: results.assignedDriver })
              .then((driver) => {
                if (driver.assignedVan) {
                  Van.findById({ _id: driver.assignedVan })
                    .then((van) => {
                      res
                        .status(200)
                        .send({ message: "The assigned Van is ", van });
                    })
                    .catch((err) => {
                      next(err);
                    });
                } else {
                  res.send
                    .status(404)
                    .send(
                      "The assigned Driver is not assigned to any van yet!"
                    );
                }
              })
              .catch((err) => {
                next(err);
              });
          } else {
            res.status(404).send({ message: "No Driver Assigned!" });
            return;
          }
        }
      }
    });
  }
);

//VIEW Assigned Route to a student
router.get(
  "/assignedroutetostudent/:sid",
  auth.verifyJwtToken,
  function (req, res, next) {
    Student.findOne({ _id: req.params.sid }).exec(function (error, results) {
      if (error) {
        res.status(500).send({ message: "Something went wrong" });
      } else {
        if (results.length == 0) {
          res.status(404).send({ message: "Student does not exist" });
          return;
        } else {
          if (results.assignedDriver) {
            Driver.findById({ _id: results.assignedDriver })
              .then((driver) => {
                if (driver.assignedRoute) {
                  Route.findById({ _id: driver.assignedRoute })
                    .then((route) => {
                      res
                        .status(200)
                        .send({ message: "The assigned Route is ", route });
                    })
                    .catch((err) => {
                      next(err);
                    });
                } else {
                  res.send
                    .status(404)
                    .send(
                      "The assigned Driver is not assigned to any route yet!"
                    );
                }
              })
              .catch((err) => {
                next(err);
              });
          } else {
            res.status(404).send({ message: "No Driver Assigned!" });
            return;
          }
        }
      }
    });
  }
);

/************************************DRIVER OPERATIONS***********************/

/* GET all driver. */
router.get("/drivers", auth.verifyJwtToken, function (req, res, next) {
  Driver.find()
    .sort("fullname")
    .exec(function (error, results) {
      if (error) {
        next(error);
      } else {
        const recordCount = results.length;
        res.status(200).send({ recordCount: recordCount, results: results });
      }
    });
});

/* GET all available drivers. */
router.get("/availabledrivers", auth.verifyJwtToken, function (req, res, next) {
  Driver.find({ assignedVan: null })
    .sort("fullname")
    .exec(function (error, results) {
      if (error) {
        next(error);
      } else {
        const recordCount = results.length;
        res.status(200).send({ recordCount: recordCount, results: results });
      }
    });
});

/* GET all available drivers with no Route. */
router.get(
  "/availableroutedrivers",
  auth.verifyJwtToken,
  function (req, res, next) {
    Driver.find({ assignedRoute: null })
      .sort("fullname")
      .exec(function (error, results) {
        if (error) {
          next(error);
        } else {
          const recordCount = results.length;
          res.status(200).send({ recordCount: recordCount, results: results });
        }
      });
  }
);

/* GET specific driver. */
router.get("/driver/:id", auth.verifyJwtToken, function (req, res, next) {
  Driver.findById(req.params.id)
    .then((driver) => {
      res.status(201).send({ message: "Driver found! ", result: driver });
    })
    .catch((err) => {
      res.status(500).send("Unable to find the driver");
    });
});

/* CREATE new Driver. */
router.post("/adddriver", auth.verifyJwtToken, function (req, res, next) {
  var fullName = req.body.fullname;
  var email = req.body.email;
  var phone_no = req.body.phone_no;
  var address = req.body.address;
  var cnic = req.body.cnic;
  var role = "driver";
  var password = req.body.password;
  bcrypt.hash(password, 10, function (err, hash) {
    if (err) {
      res.send("Something went wrong! Try Again");
    } else {
      const driver = new Driver({
        fullname: fullName,
        email,
        phone_no,
        address,
        cnic,
        role,
        password: hash,
      });
      driver
        .save()
        .then((doc) => {
          res
            .status(200)
            .send({ messaage: "Driver Registered Successfully!", result: doc });
        })
        .catch((err) => {
          next(err);
        });
    }
  });
});

/* UPDATE driver */
router.patch(
  "/updatedriver/:id",
  auth.verifyJwtToken,
  async (req, res, next) => {
    try {
      const _id = req.params.id;
      const driver = await Driver.findById({ _id });
      if (!driver) {
        res.status(404).send("Driver does not exists");
      } else {
        const updatedDriver = await Driver.findByIdAndUpdate(_id, req.body, {
          new: true,
        });
        res.status(204).send({
          message: "Following Driver has been updated successfully",
          result: updatedDriver,
        });
      }
    } catch (e) {
      res.status(500).send("Could not update driver");
    }
  }
);

//Delete Driver
router.delete(
  "/deletedriver/:id",
  auth.verifyJwtToken,
  async function (req, res, next) {
    try {
      const _id = req.params.id;
      const driver = await Driver.findById({ _id });
      if (!driver) {
        res.status(404).send("Driver does not exists");
        return;
      }
      Driver.deleteOne({ _id: req.params.id }, function (error, results) {
        if (error) {
          next(error);
        } else res.status(200).send({ message: "Following driver has been deleted successfully", result: results });
      });
    } catch (e) {
      res.status(500).send("cound not delete driver");
    }
  }
);

/* Assign Driver to Van */
router.patch(
  "/assign/:did/van/:vid",
  auth.verifyJwtToken,
  async function (req, res, next) {
    try {
      const van = await Van.findById({ _id: req.params.vid });
      if (!van) {
        res.status(404).send("Van does not exists");
        return;
      }
      const driver = await Driver.findById({ _id: req.params.did });
      if (!driver) {
        res.status(404).send("Driver does not exists");
        return;
      }
      driver.update({ assignedVan: van }, (error, updatedVan) => {
        if (error) {
          next(error);
        } else {
          res.status(200).send({
            messaage: "Driver has been assigned a van successfully!",
            result: updatedVan,
          });
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

/* Assign Driver to Route */
router.patch(
  "/assign/:did/route/:rid",
  auth.verifyJwtToken,
  async function (req, res, next) {
    try {
      const route = await Route.findById({ _id: req.params.rid });
      if (!route) {
        res.status(404).send("Route does not exists");
        return;
      }
      const driver = await Driver.findById({ _id: req.params.did });
      if (!driver) {
        res.status(404).send("Driver does not exists");
        return;
      }
      driver.updateOne({ assignedRoute: route }, (error, updatedVan) => {
        if (error) {
          next(error);
        } else {
          res.status(200).send({
            messaage: "Driver has been assigned a route successfully!",
            result: updatedVan,
          });
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

//VIEW Assigned students to a driver
router.get(
  "/assignedstudents/:did",
  auth.verifyJwtToken,
  function (req, res, next) {
    Driver.findOne({ _id: req.params.did }).exec(function (error, results) {
      if (error) {
        res.status(500).send({ message: "Something went wrong" });
      } else {
        if (results.length == 0) {
          res.status(404).send({ message: "Driver does not exist" });
          return;
        } else {
          Student.find({ assignedDriver: req.params.did })
            .then((students) => {
              if (students)
                res
                  .status(200)
                  .send({ message: "The assigned students are ", students });
              else res.status(404).send("No student is assigned to the driver");
            })
            .catch((err) => {
              next(err);
            });
        }
      }
    });
  }
);

//View Assigned Van to Driver
router.get(
  "/assignedvantodriver/:did",
  auth.verifyJwtToken,
  function (req, res, next) {
    Driver.findOne({ _id: req.params.did }).exec(function (error, results) {
      if (error) {
        res.status(500).send({ message: "Something went wrong" });
      } else {
        if (results.length == 0) {
          res.status(404).send({ message: "Driver does not exist" });
          return;
        } else {
          Van.findOne({ _id: results.assignedVan })
            .then((van) => {
              if (van)
                res.status(200).send({ message: "The assigned van is ", van });
              else res.status(404).send("Drive not assigned to any van yet");
            })
            .catch((err) => {
              next(err);
            });
        }
      }
    });
  }
);
//View Assigned route to Driver
router.get(
  "/assignedroutetodriver/:did",
  auth.verifyJwtToken,
  function (req, res, next) {
    Driver.findOne({ _id: req.params.did }).exec(function (error, results) {
      if (error) {
        res.status(500).send({ message: "Something went wrong" });
      } else {
        if (results.length == 0) {
          res.status(404).send({ message: "Driver does not exist" });
          return;
        } else {
          Route.findOne({ _id: results.assignedRoute })
            .then((route) => {
              if (route)
                res
                  .status(200)
                  .send({ message: "The assigned route is ", route });
              else res.status(404).send("Drive not assigned to any route yet");
            })
            .catch((err) => {
              next(err);
            });
        }
      }
    });
  }
);
/***********************************VAN OPERATIONS*********************************************/

/* GET all vans. */
router.get("/vans", auth.verifyJwtToken, function (req, res, next) {
  Van.find()
    .sort("vanNumber")
    .exec(function (error, results) {
      if (error) {
        res.send({ status: 500, message: "Unable to find vans" });
      } else {
        const recordCount = results.length;
        res.status(200).send({ recordCount: recordCount, results: results });
      }
    });
});

//Get all Air Conditioned Vans
router.get(
  "/airconditionedvans",
  auth.verifyJwtToken,
  function (req, res, next) {
    Van.find({ air_condition: true })
      .sort("vanNumber")
      .exec(function (error, results) {
        if (error) {
          res.send({ status: 500, message: "Unable to find vans" });
        } else {
          const recordCount = results.length;
          res.status(200).send({ recordCount: recordCount, results: results });
        }
      });
  }
);

/* GET specific van. */
router.get("/van/:id", auth.verifyJwtToken, function (req, res, next) {
  Van.findById(req.params.id)
    .then((van) => {
      res
        .status(200)
        .send({ message: "Van found successfully! ", result: van });
    })
    .catch((err) => {
      next(err);
    });
});

/* CREATE new  Van. */
router.post("/addvan", auth.verifyJwtToken, async function (req, res, next) {
  try {
    var vanNumber = req.body.vanNumber;
    var vanModel = req.body.vanModel;
    var sittingCapacity = req.body.sittingCapacity;
    var air_condition = req.body.air_condition;
    const van = await new Van({
      vanNumber,
      vanModel,
      sittingCapacity,
      air_condition,
    });
    van
      .save()
      .then((doc) => {
        res
          .status(201)
          .send({ message: "Van registered successfully! ", result: doc });
      })
      .catch((err) => {
        next(err);
      });
  } catch (e) {
    res.send(e);
  }
});

/* UPDATE Van */
router.patch("/updatevan/:id", auth.verifyJwtToken, async (req, res, next) => {
  try {
    const _id = req.params.id;
    const van = await Van.findById({ _id });
    if (!van) {
      res.status(404).send("Van does not exists");
    } else {
      const updatedVan = await Van.findByIdAndUpdate(_id, req.body, {
        new: true,
      });
      res.status(200).send({
        messaage: "Following Van has been updated successfully",
        result: updatedVan,
      });
    }
  } catch (e) {
    res.status(500).send("Could not update Van");
  }
});

//Delete Van
router.delete(
  "/deletevan/:id",
  auth.verifyJwtToken,
  async function (req, res, next) {
    try {
      const _id = req.params.id;
      const van = await Van.findById({ _id });
      if (!van) {
        res.status(404).send("Van does not exists");
        return;
      }
      Van.deleteOne({ _id: req.params.id }, function (error, results) {
        if (error) {
          res.status(500).send("Could not delete Van");
        } else res.status(200).send({ mesasge: "Following Van has been deleted successfully", result: results });
      });
    } catch (e) {
      res.status(500).send("cound not delete Van");
    }
  }
);

/***********************************ROUTE OPERATIONS*********************************************/

/* GET all routes. */
router.get("/routes", auth.verifyJwtToken, function (req, res, next) {
  Route.find()
    .sort("name")
    .exec(function (error, results) {
      if (error) {
        res.send({ status: 500, message: "Unable to find routes" });
      } else {
        const recordCount = results.length;
        res.status(200).send({ recordCount: recordCount, results: results });
      }
    });
});

/* GET specific route. */
router.get("/route/:id", auth.verifyJwtToken, function (req, res, next) {
  Route.findById(req.params.id)
    .then((route) => {
      res.status(200).send({ message: "route found! ", result: route });
    })
    .catch((err) => {
      next(err);
    });
});

/* CREATE new  route. */
router.post("/addroute", auth.verifyJwtToken, async function (req, res, next) {
  try {
    var name = req.body.name;
    var description = req.body.description;
    const route = await new Route({
      name,
      description,
    });
    route
      .save()
      .then((doc) => {
        res
          .status(201)
          .send({ message: "Route registered successfully! ", result: doc });
      })
      .catch((err) => {
        next(err);
      });
  } catch (e) {
    res.send(e);
  }
});

/* UPDATE Route */
router.patch(
  "/updateroute/:id",
  auth.verifyJwtToken,
  async (req, res, next) => {
    try {
      const _id = req.params.id;
      const _route = await Route.findById({ _id });
      if (!_route) {
        res.status(404).send("Route does not exists");
      } else {
        const updatedRoute = await Route.findByIdAndUpdate(_id, req.body, {
          new: true,
        });
        res.status(200).send({
          messaage: "Following route has been updated successfully",
          result: updatedRoute,
        });
      }
    } catch (e) {
      res.status(500).send("Could not update Route");
    }
  }
);

//Delete Route
router.delete(
  "/deleteroute/:id",
  auth.verifyJwtToken,
  async function (req, res, next) {
    try {
      const _id = req.params.id;
      const _route = await Route.findById({ _id });
      if (!_route) {
        res.status(404).send("route does not exists");
        return;
      }
      Route.deleteOne({ _id: req.params.id }, function (error, results) {
        if (error) {
          res.status(500).send("Could not delete Route");
        } else res.status(200).send({ mesasge: "Following Route has been deleted successfully", result: results });
      });
    } catch (e) {
      res.status(500).send("cound not delete Route");
    }
  }
);

//VIEW Students on a Route
router.get(
  "/studentsonroute/:rid",
  auth.verifyJwtToken,
  function (req, res, next) {
    var student = "";
    var count = 0;
    Driver.find({ assignedRoute: req.params.rid }).exec(function (
      error,
      results
    ) {
      if (error) {
        res.status(500).send({ message: "Something went wrong" });
      } else {
        if (!results) {
          //console.log(results);
          res
            .status(404)
            .send({ message: "Route is not assigned to any Driver" });
          return;
        } else {
          // console.log(results);
          results.forEach(function (driver) {
            console.log(driver._id);
            Student.find({ assignedDriver: driver._id })
              .then((students) => {
                console.log(students);
                //studentArray = studentArray.concat(students);
                student += students;
                count++;
              })
              .catch((err) => {
                next(err);
              });
          });
          console.log(count);
          if (student != null) {
            res.status(200).send({
              message: "Students on the route are ",
              students: student,
            });
            console.log(student);
          }
        }
      }
    });
  }
);

/***********************************PARENT OPERATIONS*********************************************/

/* GET all parents. */
router.get("/parents", auth.verifyJwtToken, function (req, res, next) {
  Parent.find()
    .sort("fullname")
    .exec(function (error, results) {
      if (error) {
        res.send({ status: 500, message: "Unable to find parents" });
      } else {
        const recordCount = results.length;
        res.status(200).send({ recordCount: recordCount, results: results });
      }
    });
});

/* GET specific parent. */
router.get("/parent/:id", function (req, res, next) {
  Parent.findById(req.params.id)
    .then((parent) => {
      res.status(200).send({ message: "parent found! ", result: parent });
    })
    .catch((err) => {
      next(err);
    });
});

/* CREATE new  parent. */
router.post("/addparent", auth.verifyJwtToken, async function (req, res, next) {
  try {
    var fullname = req.body.fullname;
    var email = req.body.email;
    var phone_no = req.body.phone_no;
    var homeAddress = req.body.homeAddress;
    var role = "parent";
    var password = req.body.password;
    bcrypt.hash(password, 10, async function (err, hash) {
      if (err) {
        res.send("Something went wrong! Try Again");
      } else {
        const parent = await new Parent({
          fullname,
          email,
          phone_no,
          homeAddress,
          role,
          password: hash,
        });
        parent
          .save()
          .then((doc) => {
            res.status(201).send({
              message: "Parent registered successfully! ",
              result: doc,
            });
          })
          .catch((err) => {
            next(err);
          });
      }
    });
  } catch (e) {
    res.send(e);
  }
});

/* UPDATE Parent */
router.patch(
  "/updateparent/:id",
  auth.verifyJwtToken,
  async (req, res, next) => {
    try {
      const _id = req.params.id;
      const _parent = await Parent.findById({ _id });
      if (!_parent) {
        res.status(404).send("Parent does not exists");
      } else {
        const updatedParent = await Parent.findByIdAndUpdate(_id, req.body, {
          new: true,
        });
        res.status(200).send({
          messaage: "Following parent has been updated successfully",
          result: updatedParent,
        });
      }
    } catch (e) {
      res.status(500).send("Could not update Parent");
    }
  }
);

//Delete Parent
router.delete(
  "/deleteparent/:id",
  auth.verifyJwtToken,
  async function (req, res, next) {
    try {
      const _id = req.params.id;
      const _parent = await Parent.findById({ _id });
      if (!_parent) {
        res.status(404).send("parent does not exists");
        return;
      }
      Parent.deleteOne({ _id: req.params.id }, function (error, results) {
        if (error) {
          res.status(500).send("Could not delete Parent");
        } else res.status(200).send({ mesasge: "Following Parent has been deleted successfully", result: results });
      });
    } catch (e) {
      res.status(500).send("cound not delete Parent");
    }
  }
);

/************FEES OPERATIONS****************/
/* GET all Fees. */
router.get("/fees", auth.verifyJwtToken, function (req, res, next) {
  Fee.find()
    .sort("dueDate")
    .exec(function (error, results) {
      if (error) {
        res.send({ status: 500, message: "Unable to find Fees" });
      } else {
        const recordCount = results.length;
        res.status(200).send({ recordCount: recordCount, results: results });
      }
    });
});

/* GET specific Fee. */
router.get("/fee/:id", auth.verifyJwtToken, function (req, res, next) {
  Fee.findById(req.params.id)
    .then((fee) => {
      res.status(200).send({ message: "Fee found! ", result: fee });
    })
    .catch((err) => {
      next(err);
    });
});

/* CREATE new  Challan. */
router.post(
  "/addchallan",
  auth.verifyJwtToken,
  async function (req, res, next) {
    try {
      var dueAmount = req.body.dueAmount;
      var dueDate = req.body.dueDate;
      const fee = await new Fee({
        dueAmount,
        dueDate,
      });
      fee
        .save()
        .then((doc) => {
          res
            .status(201)
            .send({ message: "Challan added successfully! ", result: doc });
        })
        .catch((err) => {
          next(err);
        });
    } catch (e) {
      res.send(e);
    }
  }
);

/* UPDATE Fee */
router.patch("/updatefee/:id", auth.verifyJwtToken, async (req, res, next) => {
  try {
    const _id = req.params.id;
    const fee = await Fee.findById({ _id });
    if (!fee) {
      res.status(404).send("Challan does not exists");
    } else {
      const updatedChallan = await Fee.findByIdAndUpdate(_id, req.body, {
        new: true,
      });
      res.status(200).send({
        messaage: "Following Challan Form has been updated successfully",
        result: updatedChallan,
      });
    }
  } catch (e) {
    res.status(500).send("Could not update Fee Challan");
  }
});

//Delete Challan
router.delete(
  "/deletefee/:id",
  auth.verifyJwtToken,
  async function (req, res, next) {
    try {
      const _id = req.params.id;
      const _fee = await Fee.findById({ _id });
      if (!_fee) {
        res.status(404).send("Fee does not exists");
        return;
      }
      Fee.deleteOne({ _id: req.params.id }, function (error, results) {
        if (error) {
          res.status(500).send("Could not delete Fee");
        } else res.status(200).send({ mesasge: "Following Fee has been deleted successfully", result: results });
      });
    } catch (e) {
      res.status(500).send("cound not delete Fee");
    }
  }
);

/***********************************Complaints OPERATIONS*********************************************/

/* GET all complaints. */
router.get("/complaints", auth.verifyJwtToken, function (req, res, next) {
  Complaint.find()
    .sort("title")
    .exec(function (error, results) {
      if (error) {
        res.send({ status: 500, message: "Unable to find complaints" });
      } else {
        const recordCount = results.length;
        res.status(200).send({ recordCount: recordCount, results: results });
      }
    });
});

/* GET specific Complaint. */
router.get("/complaint/:id", auth.verifyJwtToken, function (req, res, next) {
  Complaint.findById(req.params.id)
    .then((complaint) => {
      res.status(200).send({ message: "Complaint found! ", result: complaint });
    })
    .catch((err) => {
      next(err);
    });
});

/* UPDATE Complaint */
router.patch(
  "/updatecomplaint/:id",
  auth.verifyJwtToken,
  async (req, res, next) => {
    try {
      const _id = req.params.id;
      const complaint = await Complaint.findById({ _id });
      if (!complaint) {
        res.status(404).send("Complaint does not exists");
      } else {
        const updatedComplaint = await Complaint.findByIdAndUpdate(
          _id,
          req.body,
          {
            new: true,
          }
        );
        res.status(200).send({
          messaage: "Following Complaint has been updated successfully",
          result: updatedComplaint,
        });
      }
    } catch (e) {
      res.status(500).send("Could not update Complaint!");
    }
  }
);

/*****************************TOP PERFORMING DRIVERS********************** */
/* GET top three drivers */
router.get("/topthreedrivers", auth.verifyJwtToken, function (req, res, next) {
  var countArray = [];
  var recordArray = [];

  Driver.find({})
    .then((data) => {
      //console.log(data);
      data.forEach(function (results) {
        console.log(results);
        Student.find({ assignedDriver: data.assignedDriver }).exec(function (
          error,
          data
        ) {
          if (!error) {
            console.log(data.assignedDriver);
            recordArray.push(results.assignedDriver);
            countArray.push(data.length);
          }
        });
      });
      res.status(200).send({ count: countArray, records: recordArray });
    })
    .catch((err) => {
      res.status(500).send("Unable to find the profile details");
    });
});
//function to
module.exports = router;
