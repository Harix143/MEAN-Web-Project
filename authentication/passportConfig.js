const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const Driver = require('../models/driver.model');
const Student = require('../models/student.model');
const Parent = require('../models/parent.model');
const Admin = require('../models/admin.model');

passport.use(new localStrategy({ usernameField: 'email' },
    (email, password, done) => {
        Admin.findOne({ email },
            (err, admin) => {
                if (err)
                    return done(err);
                // unknown user
                else if (!admin) {
                    Student.findOne({ email },
                        (err, std) => {
                            if (err)
                                return done(err);
                            // unknown user
                            else if (!std) {
                                Parent.findOne({ email },
                                    (err, parent) => {
                                        if (err)
                                            return done(err);
                                        // unknown user
                                        else if (!parent) {
                                            Driver.findOne({ email },
                                                (err, dvr) => {
                                                    if (err)
                                                        return done(err);
                                                    // unknown user
                                                    else if (!dvr)
                                                        return done(null, false, { message: 'Email is not registered' });
                                                    // wrong password
                                                    else if (!dvr.verifyPassword(password))
                                                        return done(null, false, { message: 'Wrong password.' });
                                                    // authentication succeeded
                                                    else
                                                        return done(null, dvr);
                                                });
                                        }
                                        // wrong password
                                        else if (!parent.verifyPassword(password))
                                            return done(null, false, { message: 'Wrong password.' });
                                        // authentication succeeded
                                        else
                                            return done(null, parent);
                                    });
                            }
                            // wrong password
                            else if (!std.verifyPassword(password))
                                return done(null, false, { message: 'Wrong password.' });
                            // authentication succeeded
                            else
                                return done(null, std);
                        });
                }

                //return done(null, false, { message: 'Email is not registered' });
                // wrong password
                else if (!admin.verifyPassword(password))
                    return done(null, false, { message: 'Wrong password.' });
                // authentication succeeded
                else
                    return done(null, admin);
            });

    })
);