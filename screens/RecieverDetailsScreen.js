import React ,{Component} from 'react';
import {View,Text,StyleSheet,TouchableOpacity} from 'react-native';
import{Card,Header,Icon} from 'react-native-elements';
import firebase from 'firebase';
import MyHeader from '../components/MyHeader';
import db from '../config.js';
import { RFValue } from 'react-native-responsive-fontsize';

export default class RecieverDetailsScreen extends Component{
  constructor(props){
   super(props)
   this.state={
     userID: firebase.auth().currentUser.email,
     receiverID: this.props.navigation.getParam('details')['user_id'],
     requestID: this.props.navigation.getParam('details')['request_id'],
     bookName: this.props.navigation.getParam('details')['book_Name'],
     reasontorequesting: this.props.navigation.getParam('details')['reason_to_request'],
     receiverName: '',
     receiverContact: '',
     receiverAddress: '',
     receiverRequestDocID: '',
     userName: ''
   } 
  }

getRecieverDetails(){
 db.collection('users').where('email_ID', '==', this.state.receiverID).get()
 .then(snapshot=>{
   snapshot.forEach(doc=>{
     this.setState({
       receiverName: doc.data().first_Name,
       receiverContact: doc.data().Contact,
       receiverAddress: doc.data().Address
     })
   })
 })
 db.collection('requested_books').where('request_id', '==', this.state.requestID).get()
 .then(snapshot=>{
   snapshot.forEach(doc=>{
     this.setState({
       receiverRequestDocID: doc.id
     })
   })
 })
}

updateBookStatus=()=>{
  db.collection('all_donations').add({
    book_Name: this.state.bookName,
    request_id: this.state.requestID,
    requested_by: this.state.receiverName,
    donar_id: this.state.userID,
    request_status: 'donar interested'
  })
}

getUserDetails=(userID)=>{
  db.collection('users').where('email_ID', '==', userID).get()
 .then(snapshot=>{
   snapshot.forEach(doc=>{
     this.setState({
      userName: doc.data().first_Name + ' ' + doc.data().last_Name
     })
   })
  })
}

addNotification=()=>{
  var message = this.state.userName + ' has shown interest in donating the book' 
  db.collection('all_notifications').add({
    'targeted_user_ID': this.state.receiverID,
    'donar_id': this.state.userID,
    'request_id': this.state.requestID,
    'book_Name': this.state.bookName,
    'date': firebase.firestore.FieldValue.serverTimestamp(),
    'notification_status': 'unread',
    'message': message
  })
}

componentDidMount(){
  this.getRecieverDetails()
  this.getUserDetails(this.state.userID)
}

  render(){
    return(
      <View style={styles.container}>
        <View style={{flex: 0.1}}>
          <MyHeader
          title='Donate items'
          />
        </View>
        <View style={{flex: 0.3}}>
        <Card
        title='Item  Information'
        titleStyle={{fontSize:20}}
        >
          <Card>
            <Text style={{fontWeight: 'bold'}}>
              Name: {this.state.bookName}
            </Text>
          </Card>

          <Card>
            <Text style={{fontWeight: 'bold'}}>
              Reason: {this.state.reasontorequesting}
            </Text>
          </Card>

        </Card>
        </View>
        <View style={{flex: 0.3}}>
        <Card
        title='Receiver Information'
        titleStyle={{fontSize:20}}
        >
           <Card>
            <Text style={{fontWeight: 'bold'}}>
              Name: {this.state.receiverName}
            </Text>
          </Card>

          <Card>
            <Text style={{fontWeight: 'bold'}}>
              Contact: {this.state.receiverContact}
            </Text>
          </Card>

          <Card>
            <Text style={{fontWeight: 'bold'}}>
              Address: {this.state.receiverAddress}
            </Text>
          </Card>

          </Card>
        </View>
        <View style={styles.buttonContainer}>
          {
            this.state.receiverID!==this.state.userID
            ?(
              <TouchableOpacity 
              style={styles.button} 
              onPress={()=>{
                this.updateBookStatus()
                this.addNotification()
                this.props.navigation.navigate('MyDonations')}}>
                  <Text>I want to donate</Text>
                </TouchableOpacity>
            )
            :null
          }
        </View>
      </View>
      
    )
  }
}


const styles = StyleSheet.create({
  container: {
    flex:1,
  },
  buttonContainer : {
    flex:0.3,
    justifyContent:'center',
    alignItems:'center'
  },
  button:{
    width: RFValue(200),
    height: RFValue(50),
    justifyContent:'center',
    alignItems : 'center',
    borderRadius: 10,
    backgroundColor: 'orange',
    shadowColor: "#000",
    shadowOffset: {
       width: 0,
       height: 8
     },
    elevation : 16
  }
})
