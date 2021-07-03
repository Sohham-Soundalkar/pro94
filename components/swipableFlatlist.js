import React from 'react';
import {Animated, Dimensions, StyleSheet, Text, View} from 'react-native';
import { ListItem, Icon } from 'react-native-elements';
import { SwipeListView } from 'react-native-swipe-list-view';
import db from '../config';

export default class SwipableFlatlist extends React.Component{
    constructor(props){
        super(props)
        this.state={
            allNotifications: this.props.allNotifications
        }
    }

    updateMarkAsRead=(notification)=>{
        db.collection('all_notifications')
        .doc(notification.doc_id)
        .update({
            notification_status: 'read'
        })
    }

    onSwipeValueChange=(swipeData)=>{
        var allNotifications = this.state.allNotifications
        const {key,value} = swipeData
        if(value<-Dimensions.get('window').width){
            const newData = [...allNotifications]
            this.updateMarkAsRead(allNotifications[key])
            newData.splice(key,1)
            this.setState({
                allNotifications: newData
            })
        }
    }

    renderItem=(data)=>(
        <Animated.View>
            <ListItem
            leftElement={<Icon
            name = 'book'
            type = 'font-awesome'
            color = '#696969'
            />}
            title = {data.item.book_Name}
            titleStyle = {{color: 'black', fontWeight: 'bold'}}
            subtitle = {data.item.message}
            />
        </Animated.View>
    )

    renderHiddenItem=()=>(
        <View style={styles.backRow}>
            <View style={styles.backRightButton}>
                <Text style={styles.backText}>Mark As Read</Text>
            </View>
        </View>
    )

    render(){
        return(
            <View style={styles.container}>
                <SwipeListView
                disableRightSwipe
                data = {this.state.allNotifications}
                renderItem = {this.renderItem}
                renderHiddenItem = {this.renderHiddenItem}
                rightOpenValue = {-Dimensions.get('window').width}
                previewRowKey = '0'
                previewOpenValue = {-40}
                previewOpenDelay = {3000}
                onSwipeValueChange = {this.onSwipeValueChange}
                keyExtractor = {(item, index)=>index.toString()}
                />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        flex: 1
    },
    backText:{
        color: 'white',
        fontWeight: 'bold',
        fontSize: 15,
        textAlign: 'center',
        alignSelf: 'flex-start',
    },
    backRow:{
        alignItems: 'center',
        backgroundColor: '#29B6F6',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: 15
    },
    backRightButton:{
        backgroundColor: '#29B6F6',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        width: 100,
        top: 0,
        bottom: 0
    }
})