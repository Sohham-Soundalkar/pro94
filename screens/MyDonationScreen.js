import React ,{Component} from 'react'
import {View, Text,TouchableOpacity,ScrollView,FlatList,StyleSheet} from 'react-native';
import {Card,Icon,ListItem} from 'react-native-elements'
import { RFValue } from 'react-native-responsive-fontsize';
import MyHeader from '../components/MyHeader.js'
import firebase from 'firebase';
import db from '../config.js'

export default class MyDonationScreen extends Component {
 static navigationOptions={Header:null} 
   constructor(){
     super()
     this.state={
       userID: firebase.auth().currentUser.email,
       donarName: '',
       allDonations: []
     }  
     this.requestRef=null
   }

   getUserDetails=(userID)=>{
    db.collection('users').where('email_ID', '==', userID).get()
   .then(snapshot=>{
     snapshot.forEach(doc=>{
       this.setState({
        donarName: doc.data().first_Name + ' ' + doc.data().last_Name
       })
     })
    })
  }

   getAllDonations =()=>{
     this.requestRef=db.collection('all_donations').where('donar_id', '==', this.state.userID)
     .onSnapshot((snapshot)=>{
      var allDonations = []
      snapshot.docs.map((doc)=>{
        var donations = doc.data()
        donations['doc_id'] = doc.id
        allDonations.push(donations)
      })
      this.setState({
        allDonations : allDonations,
      });
    })
   }

   sendBook=(bookDetails)=>{
     if(bookDetails.request_status==='Book Sent'){
       var requestStatus = 'donar interested'
       db.collection('all_donations').doc(bookDetails.doc_id).update({
         'request_status': 'donar interested'
       })
       this.sendNotification(bookDetails, requestStatus)
     }
     else{
       var requestStatus = 'Book Sent'
       db.collection('all_donations').doc(bookDetails.doc_id).update({
        'request_status': 'Book Sent'
      })
      this.sendNotification(bookDetails, requestStatus)
     }
   }

   sendNotification=(bookDetails, requestStatus)=>{
     var requestID = bookDetails.request_id
     var donarID = bookDetails.donar_id
     db.collection('all_notifications')
     .where('request_id', '==', requestID)
     .where('donar_id', '==', donarID)
     .get()
     .then((snapshot)=>{
       snapshot.forEach((doc)=>{
         var message = ''
         if(requestStatus==='Book Sent'){
           message = this.state.donarName + ' sent you a book'
         }
         else{
           message=this.state.donarName + ' has shown interest in donating the book'
         }
         db.collection('all_notifications').doc(doc.id).update({
           'message': message,
           'notification_status': 'unread',
           'date': firebase.firestore.FieldValue.serverTimestamp()
         })
       })
     })
   }

   keyExtractor = (item, index) => index.toString()
   renderItem = ( {item, i} ) =>(
    <ListItem
      key={i}
      title={item.book_Name}
      subtitle={"Requested By : " + item.requested_by +"\nStatus : " + item.request_status}
      titleStyle={{ color: 'black', fontWeight: 'bold' }}
      rightElement={
          <TouchableOpacity
           style={[
             styles.button,
             {
               backgroundColor : item.request_status === "Book Sent" ? "green" : "#ff5722"
             }
           ]}
           onPress = {()=>{
             this.sendBook(item)
           }}
          >
            <Text style={{color:'#ffff'}}>{
              item.request_status === "Book Sent" ? "Book Sent" : "Send Book"
            }</Text>
          </TouchableOpacity>
        }
      bottomDivider
    />
  )


   componentDidMount(){
    this.getAllDonations()
    this.getUserDetails(this.state.userID)
   }

   componentWillUnmount(){
    this.requestRef()
   }

   render(){
     return(
      <View style={{flex:1}}>
         <MyHeader navigation={this.props.navigation} title="My Donations"/>
         <View style={{flex:1}}>
           {
             this.state.allDonations.length === 0
             ?(
               <View style={styles.subtitle}>
                 <Text style={{ fontSize: 20}}>List of all book Donations</Text>
               </View>
             )
             :(
               <FlatList
                 keyExtractor={this.keyExtractor}
                 data={this.state.allDonations}
                 renderItem={this.renderItem}
               />
             )
           }
         </View>
       </View>
       
     )
    }
   }


const styles = StyleSheet.create({
  button:{
    width:100,
    height:30,
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:"#ff5722",
    shadowColor: "#000",
    shadowOffset: {
       width: 0,
       height: 8
     },
    elevation : 16
  },
  subtitle :{
    flex:1,
    fontSize: RFValue(20),
    justifyContent:'center',
    alignItems:'center'
  }
})
