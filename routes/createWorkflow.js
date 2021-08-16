var express = require("express")
var router  = express.Router()
var con     = require("../connection/connection")

router.post("/createflow1", (req, res) => {
    var flowName = req.body.workflowname
    var response = res;
    con.query('INSERT INTO workflow.workflow(workflow_name) values(?)', [flowName], (error, res) => {
        if (error) {
            console.log("Something went wrong while inserting into workflow table")
        }
        else {
            console.log("Successfully inserted into workflow table")
            response.redirect(307, "/createflow")
        }
    })

})

router.post("/createflow", (req, res) => {
    var arr = []
    for (var i = 0; i < req.body.names.length; i++) {
        arr.push({ "role": req.body.names[i] })
    }
    var response = res;
    //users and workflow manipulation query.
    con.query('SELECT * FROM workflow WHERE workflow_id=(SELECT max(workflow_id) FROM workflow)', (error, res) => {
        var workflow_id = res[0].workflow_id
        for (var role of arr) {
            con.query('select user_id from workflow.users as u,workflow.users_has_roles as ur,workflow.roles as r where u.user_id = ur.Users_user_id and r.role_id = ur.roles_role_id and r.role_name = ?', [role.role], (error, res) => {
                if (error) {
                    console.log(error);
                }
                else {
                    for (var id of res) {
                        con.query('insert into workflow.users_has_workflow(Users_user_id,workflow_workflow_id) values(?,?)', [id.user_id, workflow_id], (error, res) => {
                            if (error) {
                                console.log(error);
                            }
                            else {
                                console.log(res);
                            }
                        })
                    }

                }
            })
        }
        var values = []
        con.query('select path_id from workflow.path where path_id = (select max(path_id) from workflow.path)', (error, res) => {
            var new_path_id = 0
            if (error) {
                console.log("Something went wrong")
            }
            else if (res.length === 0) {

                values.push(167)
            }
            else {
                values.push(res[0].path_id + 1);
            }

            for (var path of arr) {
                con.query('insert into workflow.path(role) values(?)', [path.role], (error, res) => {
                    if (error) {
                        console.log("something went wrong while inserting into path table")
                    }
                    else {
                        console.log("Successfully inserted into path table")
                    }
                })
            }
            console.log(values[0])
            con.query('insert into workflow.workflow_has_path(workflow_workflow_id,Path_path_id) values(?,?)', [workflow_id, values[0]], (error, res) => {
                if (error) {
                    console.log("Something went wrong while inserting into workflow_has_path table " + error)
                }
                else {
                    console.log("Successfully inserted into workflow_has_path table");
                }
                con.query('select step_id from workflow.steptracker where step_id = (select max(step_id) from workflow.steptracker)', (error, res) => {
                    var new_step_id = 0;
                    if (error) {
                        console.log("Something went wrong")
                    }
                    else if (res.length === 0) {
                        values.push(33)
                    }
                    else {
                        values.push(res[0].step_id + 1);
                    }
                    con.query('select path_id from workflow.path where path_id = (select max(path_id) from workflow.path)', (error, res) => {
                        var last_path_id = res[0].path_id;
                        con.query('insert into workflow.steptracker(step_start,step_end) values(?,?)', [values[0], last_path_id], (error, res) => {
                            if (error) {
                                console.log("Something went wrong while inserting into step tracker table")
                            }
                            else {
                                console.log("successfully inserted into steptracker table")
                            }

                            con.query('insert into workflow.path_has_steptracker(Path_path_id,steptracker_step_id) values(?,?)', [values[0], values[1]], (error, res) => {
                                if (error) {
                                    console.log("something went wrong while inserting into path_has_steptracker table " + error)
                                }
                                else {
                                    console.log("Successfully inserted into path_has_steptracker table")
                                    con.query('select Path_path_id from workflow.path_has_steptracker where Path_path_id = (select max(Path_path_id) from workflow.path_has_steptracker)', (error, res) => {
                                        con.query('update workflow.path SET state = ? where path_id=?', [1, res[0].Path_path_id], (error, res) => {
                                            if (error) {
                                                console.log("something went wrong while updating path table")
                                            }
                                            else {
                                                console.log("Successfully update path table")
                                                response.send("hii");
                                            }

                                        })


                                    })
                                }
                            })
                        })

                    })
                })
            })


        })

    })

})
module.exports = router;