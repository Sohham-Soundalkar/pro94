import React,{Component} from 'react';
import {View,Text,TextInput,KeyboardAvoidingView,StyleSheet,TouchableOpacity,Alert,FlatList,ToastAndroid} from 'react-native';
import db from '../config';
import firebase from 'firebase';
import MyHeader from '../components/MyHeader';
import { RFValue } from 'react-native-responsive-fontsize';

export default class BookRequestScreen extends Component{
    constructor(){
        super()
        this.state={
            userName: firebase.auth().currentUser.email,
            itemName: '',
            description: '',
            requestedItemName: '',
            exchangeId: '',
            itemStatus: '',
            docId: '',
            itemValue: '',
            currencycode: ''
        }
    }

    createUniqueId(){
        return Math.random().toString(36).substring(7);
    }

    addItem=async(itemName, description)=>{
        var userName = this.state.userName
        var exchangeId = this.createUniqueId()
      console.log("adding")
        db.collection('requested_books').add({
            'user_id': userName,
            'book_Name': itemName,
            'reason_to_request': description,
            'request_id': exchangeId,
            'book_Status': 'requested',
            'date': firebase.firestore.FieldValue.serverTimestamp(),
        })
        await this.getExchangeRequest()
        db.collection('users').where('email_ID', '==', userName).get()
        .then()
        .then((snapshot)=>{
          snapshot.forEach((doc)=>{
            db.collection('users').doc(doc.id).update({
              IsBookRequestActive: true
            })
          })
        })

        return Alert.alert(
          'Item ready to exchange',
          '',
          [
            {text: 'OK', onPress:()=>{
              this.props.navigation.navigate('donateBooks')
            }}
          ]
        )
    }

    getIsExchangeRequestActive(){
      db.collection('users')
      .where('email_ID','==',this.state.userName)
      .onSnapshot(querySnapshot => {
        querySnapshot.forEach(doc => {
          this.setState({
            IsBookRequestActive:doc.data().IsBookRequestActive,
            userDocID : doc.id,
            currencycode: doc.data().currency_code
          })
        })
      })
    }

    getExchangeRequest=()=>{
      var exchangeRequest = db.collection('requested_books')
      .where('email_ID','==',this.state.userName)
      .get()
      .then((snapshot)=>{
          snapshot.forEach((doc)=>{
              if(doc.data().book_Status!=='received'){
                  this.setState({
                      exchangeId: doc.data().request_id,
                      requestedItemName: doc.data().book_Name,
                      itemStatus: doc.data().book_Status,
                      itemValue: doc.data().item_value,
                      docId: doc.id,
                  })
              }
          })
      })
  }

  getData(){
    fetch('http://data.fixer.io/api/latest?access_key=c474208be3973959ee8f98bd2921128f&format=1')
    .then(response=>{
      return response.json()
    }).then(responseData=>{
      var currencyCode = this.state.currencycode
      var currency = responseData.rates.INR
      var value = 69 / currency
      console.log(value)
    })
  }

  componentDidMount(){
    this.getExchangeRequest()
    this.getIsExchangeRequestActive()
    this.getData()
}

    receivedItem=(itemName)=>{
        var userId = this.state.userName
        var exchangeId = this.state.exchangeId
        db.collection('received_books').add({
            "user_id": userId,
            "book_Name":itemName,
            "request_id"  : exchangeId,
            "bookStatus"  : "received",
      
        })
      }

      updateExchangeRequestStatus=()=>{
        //updating the book status after receiving the book
        db.collection('requested_books').doc(this.state.docID)
        .update({
          book_Status : 'received'
        })
      
        //getting the  doc id to update the users doc
        db.collection('users').where('email_ID','==',this.state.userName).get()
        .then((snapshot)=>{
          snapshot.forEach((doc) => {
            //updating the doc
            db.collection('users').doc(doc.id).update({
              IsBookRequestActive: false
            })
          })
        })
      }

      sendNotification=()=>{
        //to get the first name and last name
        db.collection('users').where('email_ID','==',this.state.userName).get()
        .then((snapshot)=>{
          snapshot.forEach((doc)=>{
            var name = doc.data().first_Name
            var lastName = doc.data().last_Name
      
            // to get the donor id and book nam
            db.collection('all_notifications').where('request_id','==',this.state.exchangeId).get()
            .then((snapshot)=>{
              snapshot.forEach((doc) => {
                var donorId  = doc.data().donar_id
                var bookName =  doc.data().book_Name
      
                //targert user id is the donor id to send notification to the user
                db.collection('all_notifications').add({
                  "targeted_user_ID" : donorId,
                  "message" : name +" " + lastName + " received the item " + itemName ,
                  "notification_status" : "unread",
                  "item_name" : itemName
                })
              })
            })
          })
        })
      }

   render(){
     if(this.state.IsBookRequestActive === true){
       return(
         <View style = {{flex: 1, justifyContent: 'center'}}>
           <View style={{borderColor: 'orange', borderWidth: 2, justifyContent: 'center', alignItems: 'center', padding: 10, margin: 10}}>
             <Text>Item Name</Text>
             <Text>{this.state.requestedItemName}</Text>
           </View>
           <View style={{borderColor: 'orange', borderWidth: 2, justifyContent: 'center', alignItems: 'center', padding: 10, margin: 10}}>
             <Text>Item Value</Text>
             <Text>{this.state.itemValue}</Text>
           </View>
           <View style={{borderColor: 'orange', borderWidth: 2, justifyContent: 'center', alignItems: 'center', padding: 10, margin: 10}}>
             <Text>Item Status</Text>
             <Text>{this.state.itemStatus}</Text>
           </View>

           <TouchableOpacity style={{borderWidth:1,borderColor:'orange',backgroundColor:'orange', width:300,alignSelf:'center',alignItems:'center'}}
           onPress={()=>{
             this.sendNotification()
             this.updateExchangeRequestStatus()
             this.receivedItem(this.state.requestedItemName)
           }}>
             <Text>I received the Item</Text>
           </TouchableOpacity>
         </View>
       )
     }

     else{
       return(
         <View style={{flex:1}}>
           <MyHeader title='Add Item' navigation={this.props.navigation}/>
           <KeyboardAvoidingView style={{flex:1, justifyContent:'center', alignItems:'center'}}>
             <TextInput
             style={styles.formTextInput}
             placeholder={'Item Name'}
             maxLength={8}
             onChangeText={(text)=>{
               this.setState({
                 itemName: text
               })
             }}
             value={this.state.itemName}
             />

             <TextInput
             multiline
             numberOfLines={4}
             style={[styles.formTextInput,{height:100}]}
             placeholder={'Description'}
             onChangeText={(text)=>{
               this.setState({
                 description: text
               })
             }}
             value={this.state.description}
             />

             <TextInput
             style={styles.formTextInput}
             placeholder={'Item Value'}
             maxLength={8}
             onChangeText={(text)=>{
               this.setState({
                 itemValue: text
               })
             }}
             value={this.state.itemValue}
             />

             <TouchableOpacity
             style={[styles.button,{marginTop:10}]}
             onPress={()=>{this.addItem(this.state.itemName, this.state.description)}}
             >
               <Text style={{color:'#ffff', fontSize:18, fontWeight:'bold'}}>Add Item</Text>
             </TouchableOpacity>
           </KeyboardAvoidingView>
         </View>
       )
     }
   }  
}

const styles = StyleSheet.create({
  formTextInput:{
    width: '75%',
    height: RFValue(35),
    alignSelf:'center',
    borderColor:'#ffab91',
    borderRadius:10,
    borderWidth:1,
    marginTop:20,
    padding:10
  },
  button:{
    width:'75%',
    height: RFValue(50),
    justifyContent:'center',
    alignItems:'center',
    borderRadius:10,
    backgroundColor:'#ff5722',
    shadowColor:'#000',
    shadowOffset:{
      width:0,
      height:8,
    },
    shadowOpacity:0.44,
    shadowRadius:10.32,
    elevation:16
  },
})

