var express = require("express")
var router  = express.Router()
var con     = require("../connection/connection")


router.post("/SignUp", (req, res) => {
    console.log(req.body)
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var email = req.body.email;
    var password = req.body.password;
    var phoneNo = req.body.pno;
    var username = req.body.userid;
    var role = req.body.state.age;
    if (role == 10) {
        role = "manager"
    }
    else if( role == 30){
        role = "developer"
    }
    else if(role == 40){
        role = "lead";
    }

    con.query('INSERT INTO Users (first_Name,last_Name,email,password,phone_No,Role,username) VALUES(?,?,?,?,?,?,?)', [firstName, lastName, email, password, phoneNo, role, username], (error, results) => {
        if (error) {
            console.log(error)
            res.send("Sorry Couldn't insert")
        }
        else {
            var insert_id = results.insertId
            con.query("select role_id FROM workflow.roles where role_name = ?",[role],(error,res1)=>{
                var role_id = res1[0].role_id
                con.query("INSERT INTO workflow.users_has_roles(Users_user_id,roles_role_id) VALUES(?,?)",[insert_id,role_id],(error,res2)=>{
                    con.query("select user_id from workflow.users where Role =?",[role],(error,res3)=>{
                        if(res3.length === 0){
                            res.send("You have no workflow")
                        }
                        else{
                            con.query("select workflow_workflow_id from workflow.users_has_workflow where Users_user_id = ?",[res3[0].user_id],(error,res4)=>{
                                if(res4.length === 0){
                                    res.send("You have no workflows")
                                }
                                else{
                                    var vals = `(${insert_id},${res4[0].workflow_workflow_id})`
                                    for(var i=1;i<res4.length;i++){
                                        vals += `,(${insert_id},${res4[i].workflow_workflow_id})`
                                    }
                                    con.query("INSERT INTO workflow.users_has_workflow(Users_user_id,workflow_workflow_id) values"+vals,(error,res6)=>{
                                        if(error){
                                            console.log("User not created")
                                        }
                                        else{
                                            console.log("User sucessfully created");
                                        }
                                    })
                                }
                            })
                        }
                    })
                })
            })
        }
    })
})

module.exports = router