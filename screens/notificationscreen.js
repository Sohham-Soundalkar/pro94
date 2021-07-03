import React, { Component } from 'react';
import { StyleSheet, View, FlatList,Text } from 'react-native';
import { ListItem, Icon } from 'react-native-elements';
import firebase from 'firebase';
import MyHeader from '../components/MyHeader';
import SwipableFlatlist from '../components/swipableFlatlist';
import { RFValue } from 'react-native-responsive-fontsize';
import db from '../config';

export default class NotificationScreen extends Component{
  constructor(props) {
    super(props);

    this.state = {
      userID :  firebase.auth().currentUser.email,
      allNotifications : []
    };

    this.notificationRef = null
  }

  getNotifications=()=>{
    this.requestRef=db.collection('all_notifications').where('notification_status', '==', 'unread')
    .where('targeted_user_ID', '==', this.state.userID)
    .onSnapshot((snapshot)=>{
     var allNotifications = []
     snapshot.docs.map((doc)=>{
       var notifications = doc.data()
       notifications['doc_id'] = doc.id
       allNotifications.push(notifications)
     })
     this.setState({
       allNotifications : allNotifications,
     });
   }) 
  }

  componentDidMount(){
    this.getNotifications()
  }

  componentWillUnmount(){
    this.notificationRef()
  }

  keyExtractor = (item, index) => index.toString()
  renderItem=({item, index})=>{
      return(
          <ListItem
          key={index}
          title={item.book_Name}
          titleStyle={{color: 'black', fontWeight: 'bold'}}
          subtitle={item.message}
          bottomDivider
          />
      )
  }

  render(){
    return(
      <View style={styles.container}>
        <View style={{flex:0.1}}>
          <MyHeader title={"Notifications"} navigation={this.props.navigation}/>
        </View>
        <View style={{flex:0.9}}>
          {
            this.state.allNotifications.length === 0
            ?(
              <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
                <Text style={{fontSize:25}}>You have no notifications</Text>
              </View>
            )
            :(
              <SwipableFlatlist allNotifications = {this.state.allNotifications} />
            )
          }
        </View>
      </View>
    )
  }
}


const styles = StyleSheet.create({
  container : {
    flex : 1
  }
})

