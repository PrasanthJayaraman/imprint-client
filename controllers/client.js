var Client = require('../models/clients');
var common = require('../helpers/common');
var _ = require('lodash');

var CLIENTID = 'CLIENT0005001';

exports.addClient = function (req, res, next) {
    var user = req.user;
    var client = req.body;

    console.log(user);

    if (!client || Object.keys(client).length === 0 || !client.name || !client.address || !client.contact || !client.person) {
        return res.status(400).send({
            message: "Some Mandatory field is missing"
        });
    }

    if (client.name.length < 8) {
        return res.status(400).send({
            message: "Client name should be minimum * characters length"
        });
    }

    Client.findByName(client.name, function (err, clients) {
        if (err) {
            return res.status(401).send({
                message: "Error looking up Client Information"
            });
        } else if (clients.length > 0) {
            return res.status(409).send({
                message: "Already a Client available with this name"
            });
        } else {
            Client.findLatest(function (err, latest) {
                console.log(err, latest);
                if (err) {
                    return res.status(401).send({
                        message: "Error looking up Client Information"
                    });
                } else {
                    if (latest.length > 0 && latest[0].clientId) {
                        let tmp = latest[0].clientId.split('T');
                        let n = parseInt(tmp[1]);
                        n++;
                        client.clientId = 'CLIENT000' + n;
                    } else {
                        client.clientId = CLIENTID;
                    }

                    var createdBy = {
                        id: user.employee._id.toString(),
                        name: user.employee.name,
                        photo: user.employee.photo,
                    };
                    var log = {
                        created: new Date(),
                        text: 'Created',
                        type: 'Client',
                        by: user.employee.name
                    };

                    if (user.employee.type !== 'manager') {
                        client.assignedTo = createdBy;
                    }

                    client.createdBy = createdBy;
                    client.created = new Date();
                    client.modified = new Date();
                    client.logs = [];
                    client.logs.push(log);

                    console.log(client);

                    var data = new Client(client);
                    data.save(function (err) {
                        // If duplicate error then it is already available so use the same one
                        if (err && !err.code === 11000) {
                            return res.status(401).send({
                                message: "Error Saving Client Information"
                            });
                        } else {
                            return res.status(201).send();
                        }
                    });
                }
            });
        }
    });
}

exports.editClient = function (req, res, next) {
    var user = req.user;
    var client = req.body;

    console.log(user);

    if (!client || Object.keys(client).length === 0 || !client.name || !client.address || !client.contact || !client.person || !client.id) {
        return res.status(400).send({
            message: "Some Mandatory field is missing"
        });
    }

    if (client.name.length < 8) {
        return res.status(400).send({
            message: "Client name should be minimum * characters length"
        });
    }

    Client.findByName(client.name, function (err, clients) {
        if (err) {
            return res.status(401).send({
                message: "Error looking up Client Information"
            });
        } else if (clients.length > 0) {
            return res.status(409).send({
                message: "Already a Client available with this name"
            });
        } else {
            var log = {
                created: new Date(),
                text: 'Updated',
                type: 'Client',
                by: user.employee.name
            };
            Client.update({
                _id: client.id
            }, {
                $push: {
                    logs: log
                },
                address: client.address,
                name: client.name,
                person: client.person,
                contact: client.contact,
                assignedTo: client.assignedTo,
                modified: new Date()
            }, function (err, data) {
                if (err && !err.code === 11000) {
                    return res.status(401).send({
                        message: "Error Saving Client Information"
                    });
                } else {
                    return res.status(201).send();
                }
            });
        }
    });
}

exports.clientList = function (req, res, next) {
    var user = req.user;
    var id = req.params.id;

    if (!id) {

        if (user.employee.type == 'manager') {
            query = {};
        } else {
            query = {
                'createdBy.id': user.employee._id
            }
        }

        Client.find(query, {
            name: 1,
            clientId: 1,
            createdBy: 1,
            assignedTo: 1,
            modified: 1
        }, function (err, clients) {
            if (err) {
                return res.status(401).send({
                    message: "Error looking up Client Information"
                });
            } else {
                return res.status(200).send(_.sortBy(clients, 'name'));
            }
        });
    } else {
        Client.find({
            clientId: id
        }, function (err, clients) {
            if (err) {
                return res.status(401).send({
                    message: "Error looking up Client Information"
                });
            } else {
                return res.status(200).send(_.sortBy(clients, 'name'));
            }
        });
    }
}