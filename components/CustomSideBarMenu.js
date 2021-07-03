import React,{Component} from 'react';
import {View, StyleSheet, Text, TouchableOpacity} from 'react-native';
import {DrawerItems} from 'react-navigation-drawer';
import firebase from 'firebase';
import { Avatar } from 'react-native-elements';
import * as ImagePicker from 'expo-image-picker';
import db from '../config';


export default class CustomSideBarMenu extends Component{
    constructor(){
        super()
        this.state={
            userID: firebase.auth().currentUser.email,
            image: '#',
            name: '',
            docID: ''
        }
    }

    selectPicture=async()=>{
        const {cancelled, uri} = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4,3],
            quality: 1
        })
        if(!cancelled){
            this.uploadImage(uri, this.state.userID)
        }
    }

    uploadImage=async(uri, imageName)=>{
        var response = await fetch(uri)
        var blob = await response.blob()
        var ref = firebase
        .storage()
        .ref()
        .child('user_profiles/' + imageName)
        return ref.put(blob).then((response)=>{
            this.fetchImage(imageName)
        })
    }

    fetchImage=(imageName)=>{
        var storageref = firebase
        .storage()
        .ref()
        .child('user_profiles/' + imageName)

        storageref.getDownloadURL()
        .then((url)=>{
            this.setState({
                image: url
            })
        })
        .catch((error)=>{
            this.setState({
                image: '#'
            })
        })
    }

    getUserProfile(){
        db.collection('users').where('email_ID', '==', this.state.userID)
        .onSnapshot((querySnapshot)=>{
            querySnapshot.forEach((doc)=>{
                this.setState({
                    name: doc.data().first_Name + ' ' + doc.data().last_Name,
                    docID: doc.id,
                    image: doc.data().image
                })
            })
        })
    }

    componentDidMount(){
        this.fetchImage(this.state.userID)
        this.getUserProfile()
    }

    render(){
        return(
            <View style={{flex:1}}>
                <View style={{flex: 0.5, alignItems: 'center', backgroundColor: 'orange'}}>
                    <Avatar
                    rounded
                    source={{uri: this.state.image}}
                    size= 'medium'
                    onPress={()=>this.selectPicture()}
                    containerStyle={styles.imageContainer}
                    showEditButton
                    />
                    <Text style={{fontWeight: '100', fontSize: 20, paddingTop: 10}}>{this.state.name}</Text>
                </View>
                <View style={{flex:0.8}}>
                    <DrawerItems {...this.props}/>
                </View>
                <View style={styles.logOutConatiner}>
                    <TouchableOpacity
                    style={styles.logOutButton}
                    onPress={()=>{
                        this.props.navigation.navigate('WelcomeScreen')
                        firebase.auth().signOut()
                    }}
                    >
                        <Text style={styles.logOutText}>LogOut</Text>
                    </TouchableOpacity>
                </View>
            </View> 
        )
    }
}

const styles = StyleSheet.create({
    logOutConatiner:{
        flex:0.2,
        justifyContent: 'flex-end',
        paddingBottom: 30
    },
    logOutButton:{
        height: 30,
        width: '100%',
        justifyContent: 'center',
        padding: 10,
    },
    logOutText:{
        fontSize: 30,
        fontWeight: 'bold'
    },
    imageContainer:{
        flex: 0.75,
        width: '40%',
        height: '20%',
        marginLeft: 20,
        marginTop: 30,
        borderRadius: 40
    }
})