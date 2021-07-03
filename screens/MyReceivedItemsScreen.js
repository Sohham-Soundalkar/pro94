import React, { Component } from 'react';
import { View, StyleSheet, Text, FlatList,TouchableOpacity } from 'react-native';
import { ListItem } from 'react-native-elements'
import firebase from 'firebase';
import db from '../config'
import MyHeader from '../components/MyHeader';
import { RFValue } from 'react-native-responsive-fontsize';

export default class MyReceivedItemsScreen extends Component{
  constructor(){
    super()
    this.state = {
      userID : firebase.auth().currentUser.email,
      receivedBooksList : []
    }
  this.requestRef= null
  }

  getReceivedBooksList =()=>{
    this.requestRef = db.collection("requested_books")
    .where('user_id','==',this.state.userID)
    .where("bookStatus", '==','received')
    .onSnapshot((snapshot)=>{
      var receivedBooksList = snapshot.docs.map((doc) => doc.data())
      this.setState({
        receivedBooksList : receivedBooksList
      });
    })
  }

  componentDidMount(){
    this.getReceivedBooksList()
  }

  componentWillUnmount(){
    this.requestRef();
  }

  keyExtractor = (item, index) => index.toString()

  renderItem = ( {item, i} ) =>{
    console.log(item.book_Name);
    return (
      <ListItem
        key={i}
        title={item.book_Name}
        subtitle={item.bookStatus}
        titleStyle={{ color: 'black', fontWeight: 'bold' }}
        bottomDivider
      />
    )
  }

  render(){
    return(
      <View style={{flex:1}}>
        <MyHeader title="Received Items" navigation ={this.props.navigation}/>
        <View style={{flex:1}}>
          {
            this.state.receivedBooksList.length === 0
            ?(
              <View style={styles.subContainer}>
                <Text style={{ fontSize: 20}}>List Of All Received Items</Text>
              </View>
            )
            :(
              <FlatList
                keyExtractor={this.keyExtractor}
                data={this.state.receivedBooksList}
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
  subContainer:{
    flex:1,
    fontSize:  RFValue(20),
    justifyContent:'center',
    alignItems:'center'
  },
  button:{
    width: RFValue(100),
    height: RFValue(30),
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:"#ff5722",
    shadowColor: "#000",
    shadowOffset: {
       width: 0,
       height: 8
     }
  }
})
