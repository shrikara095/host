var express = require("express")
var bodyParser = require("body-parser")
var app = express()
app.listen(process.env.PORT);
let port = process.env.PORT;
if (port == null || port == "") {
  port = 8080;
}

const cors = require('cors')
var async = require("async")

//connection
var con = require("./connection/connection")

//routes
var workflowCreation = require("./routes/createWorkflow")
var signup = require("./routes/signup")

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

// app.use(function(req, res, next) {
//     // var origin = req.get('origin');
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     res.header("Access-Control-Allow-Origin", 'PUT,POST,GET,DELETE,OPTIONS');
//     next();
// });

app.post("/login", (req, res) => {
    console.log(req.body)
    var userid = req.body.username;
    var password = req.body.password;
    console.log(userid)
    console.log(password)
    con.query('SELECT * FROM Users where username=? and password=?', [userid, password], (error, results, fields) => {
        if(results.length)
        {
              res.send("success")
        }
        else
        {
                res.send("error")
        }
        console.log(results)
      

    })
})


app.use(signup)
app.use(workflowCreation)


var user = "eren_Vanguard_tit"
app.get("/getWorkFlow", (req, res1) => {
    var paths = []
    var request = res1;
    con.query('SELECT workflow_workflow_id from workflow.users as u,workflow.users_has_workflow as ur,workflow.workflow as w where u.user_id = ur.Users_user_id and ur.workflow_workflow_id = w.workflow_id and u.username = ?', [user], (req, res) => {
        async.each(res, (res, callback) => {
            con.query('select Path_path_id from workflow.workflow_has_path where workflow_workflow_id = ?', [res.workflow_workflow_id], (error, res1) => {
                //console.log(res1[0].Path_path_id)
                con.query('select steptracker_step_id from workflow.path_has_steptracker where Path_path_id = ?', [res1[0].Path_path_id], (error, res2) => {
                    //console.log(res2[0].steptracker_step_id);
                    con.query('select step_start,step_end from workflow.steptracker where step_id = ?', [res2[0].steptracker_step_id], (error, res3) => {
                        //console.log(res2[0]);
                        con.query('select * from workflow.path where path_id between ? and ?', [res3[0].step_start, res3[0].step_end], (error, res4) => {
                            //console.log(res4)
                            for (var j = 0; j < res4.length; j++) {
                                res4[j].workflow_id = res.workflow_workflow_id;
                                paths.push(res4[j])

                            }
                            callback(null)
                        })

                    })

                })


            })

        }, function (err) {
            //request.send(paths)
            var arr2 = [];
            // console.log(window.arr2)
            var arr3 = [];
            var arr4 = [];
            var arr5 = [];
            var arr10 = [];
            var arr11 = [];
            var sum1 = [];
            final = [];
            paths.map(car2)
            hii()

            // console.log(window.arr11)

            function car2(car) {
                console.log(car)
                for (const item in car) {
                    if (item === "workflow_id") {
                        arr2.push(car[item]);
                    }
                    if (item === "role") {
                        arr4.push(car[item]);
                    }
                    if (item === "state") {
                        arr5.push(car[item]);
                    }
                }
                // console.log(arr5)
            }


            function hii() {
                var cnt = 0;
                var a = arr2[0];
                console.log(arr4)
                for (var i = 0; i < arr2.length; i++) {
                    // console.log(window.arr2[i]);
                    if (a === arr2[i]) {
                        cnt += 1;

                        a = arr2[i];
                        continue;
                    } else {
                        arr3.push(cnt);
                        cnt = 1;
                        a = arr2[i];
                    }
                }
                arr3.push(cnt);
                var k = -1;
                var su = 0;
                console.log(arr3);
                for (var i = 0; i < arr3.length; i++) {
                    var z = arr3[i];
                    for (var j = 0; j < z; j++) {
                        k += 1;
                        if (arr5[k] === 1) {
                            su = j;
                        }
                        arr10.push(arr4[k]);
                    }
                    sum1.push(su);
                    arr11.push(arr10);
                    arr10 = [];
                    su = 0;
                    console.log("hello");
                }
                var leng = arr11.length;
                var j = -1;
                for (var i = 0; i < leng; i++) {
                    j += 1;

                    arr11[i].splice(0, 0, sum1[j]);
                    // i += window.arr3[j];
                }
            }
            console.log(sum1);
            console.log(arr11)
            request.send(arr11)
        })

    })

})
//=====================================================================================================================================
var msg="";
var workflow_name="";
var permission="";
app.post("/form", (req, res) => {
    console.log(req.body.workflowname)
     workflow_name = req.body.workflowname;
     permission = req.body.action;
    msg=req.body.note;
    con.query("select workflow_id from workflow.workflow where workflow_name = ?", [workflow_name], (error, res1) => {
        con.query("select Path_path_id from workflow.workflow_has_path where workflow_workflow_id = ?", [res1[0].workflow_id], (error, res2) => {
            con.query("select steptracker_step_id from workflow.path_has_steptracker where Path_path_id = ?", [res2[0].Path_path_id], (error, res3) => {
                con.query("select step_start,step_end from workflow.steptracker where step_id = ?", [res3[0].steptracker_step_id], (error, res4) => {
                    var step_start = res4[0].step_start
                    var step_end = res4[0].step_end
                    if (permission === "approve") {
                        con.query("update workflow.path set state = ? where path_id between ? and ? and state = ?", [2, step_start, step_end, 1], (error, res5) => {
                            con.query("SELECT path_id FROM workflow.path where path_id = (select min(path_id) from workflow.path where path_id between ? and ? and state = ?)", [step_start, step_end, 0], (error, res6) => {
                                if (res6.length > 0) {
                                    con.query("update workflow.path set state = ? where path_id = ?", [1, res6[0].path_id], (error, res7) => {
                                        if (error) {
                                            res.send("Something went wrong while updating path table")
                                        }
                                        else {
                                            res.redirect(307, "/addmessage?type=approve")

                                        }
                                    })
                                }
                                else {
                                    res.send("You have reached the end of record")
                                }
                            })
                        })
                    }
                    else {
                        //This query is to verify if the workflow is at the inception.
                        con.query("select path_id from workflow.path where path_id between ? and ? and state = ? and path_id!= (select min(path_id) from workflow.path where path_id between ? and ?)", [step_start, step_end, 1, step_start, step_end], (error, res5) => {
                            if (res5.length != 0) {
                                con.query("update workflow.path set state = ? where path_id = ?", [0, res5[0].path_id], (error, res6) => {
                                    con.query("SELECT path_id FROM workflow.path where path_id = (select max(path_id) from workflow.path where path_id between ? and ? and state = ?)", [step_start, step_end, 2], (error, res7) => {
                                        con.query("update workflow.path set state=? where path_id=?", [1, res7[0].path_id], (error, res8) => {
                                            if (error) {
                                                res.send("Something went wrong while updating path table (deny block)")
                                            }
                                            else {
                                                res.redirect(307, "/addmessage?type=deny")
                                            }
                                        })
                                    })
                                })
                            }
                            else {
                                res.send("This is the start of the workflow")
                            }
                        })
                    }
                })
            })
        })
    })
})
//===========================================================================================================================
//messages
var username = "eren_Vanguard_tit"
// var msg = "don't expect that any time sooner !! lol"
app.post("/addmessage", (req, res) => {
    var type = req.query.type;
    con.query("INSERT INTO workflow.messages(message,message_type) VALUES(?,?)", [msg, type], (error, res1) => {
        var msg_id = res1.insertId
        con.query("select user_id from workflow.users where username = ?", [username], (error, res2) => {
            var from_user_id = res2[0].user_id;
            con.query("INSERT INTO workflow.messages_has_users(messages_msg_id,users_user_id) VALUES(?,?)", [msg_id, from_user_id], (error, res3) => {
                if (error) {
                    console.log("Something went wrong while inserting into message_has_users table")
                }
                else {
                    console.log("Successfully inserted into message_has_users table")
                    con.query("select workflow_id from workflow.workflow where workflow_name = ?", [workflow_name], (error, res4) => {
                        var workflow_id = res4[0].workflow_id
                        con.query("select Path_path_id from workflow.workflow_has_path where workflow_workflow_id = ?", [workflow_id], (error, res5) => {
                            var path_id = res5[0].Path_path_id
                            con.query("select steptracker_step_id from workflow.path_has_steptracker where Path_path_id = ?", [path_id], (error, res6) => {
                                var step_id = res6[0].steptracker_step_id
                                con.query("select step_start,step_end from workflow.steptracker where step_id = ?", [step_id], (error, res7) => {
                                    var stepstart = res7[0].step_start
                                    var stepend = res7[0].step_end
                                    con.query("select role from workflow.path where path_id between ? and ? and state = ?", [stepstart, stepend, 1], (error, res8) => {
                                        con.query("select role_id from workflow.roles where role_name = ?", [res8[0].role], (error, res9) => {
                                            con.query("INSERT INTO workflow.roles_has_messages(roles_role_id,messages_msg_id) VALUES(?,?)", [res9[0].role_id, msg_id], (error, res9) => {
                                                if (error) {
                                                    console.log("Something went wrong while inserting into roles_has_message table")
                                                }
                                                else {
                                                    console.log("Successfully inserted into roles_has_message table")
                                                }
                                            })
                                        })
                                    })
                                })
                            })
                        })
                    })
                }
            })
        })

    })

})

var role = "developer"
//To get messages for a user
app.get("/getmessages", (req, res) => {
    console.log("hiii")
    con.query("select * from workflow.users as u,workflow.messages_has_users as mu,workflow.messages as m,workflow.roles_has_messages as rm,workflow.roles as r where u.user_id = mu.users_user_id and mu.messages_msg_id = m.msg_id and m.msg_id = rm.messages_msg_id and rm.roles_role_id = r.role_id and role_name=?", [role], (error, res1) => {
        console.log(res1)
        res.send(res1)
    })
})

app.listen(port, () => `${port}`, () => {
    console.log("Server started")
})