import React, { useContext, useState, useEffect } from 'react';
import { View, Text, SafeAreaView, StyleSheet, ScrollView, Dimensions, Image, Platform, Alert, FlatList } from 'react-native'
import CustomHeader from '../../components/CustomHeader'
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { ArrowDown, ArrowGratter, ArrowUp, GreenTick, Payment, RedCross, YellowTck, cardArrowImg, dateIcon, notifyImg, timeIcon, userPhoto } from '../../utils/Images'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dropdown } from 'react-native-element-dropdown';
import Modal from "react-native-modal";
import Icon from 'react-native-vector-icons/Entypo';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import CustomButton from '../../components/CustomButton'
import moment from 'moment';
import axios from 'axios';
import Loader from '../../utils/Loader';
import { API_URL } from '@env'
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';



const OrderSummary = ({  route }) => {
    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState(false)
    const [details, setDetails] = useState(route?.params?.details)

    useEffect(() => {
        console.log(route?.params?.details, 'details from order summary page')
    }, []);
    useFocusEffect(
        React.useCallback(() => {

        }, [])
    )


    if (isLoading) {
        return (
            <Loader />
        )
    }


    return (
        <SafeAreaView style={styles.Container}>
            <CustomHeader commingFrom={'Order Summary'} onPress={() => navigation.goBack()} title={'Order Summary'} />
            <ScrollView style={styles.wrapper}>
                <View style={styles.itemContainer}>
                    <Image source={userPhoto} style={styles.avatar} />
                    <View style={styles.itemTextContainer}>
                        <Text style={[styles.itemName, styles.textWithMargin]}>Cameron Williamson</Text>
                        <Text style={[styles.itemDetails, styles.textWithMargin]}>Kal Sarp Dasha Remedies</Text>
                        <Text style={[styles.itemDetails, styles.textWithMargin]}>Date: <Text style={styles.itemDetailsValue}>24-02-24, 09:30 PM</Text></Text>
                        <Text style={styles.itemDetails}>Session Time: <Text style={styles.itemDetailsValue}>8 Min</Text></Text>
                    </View>
                </View>
                <Text style={styles.headerText}>Payment Details</Text>
                <View style={styles.cardView}>
                    <View style={styles.flexView}>
                        <Text style={styles.flexHeader}>Gross Earning</Text>
                        <Text style={styles.flexValue}>₹ 100</Text>
                    </View>
                    <View style={styles.flexView}>
                        <Text style={styles.flexHeader}>Platform Fee</Text>
                        <Text style={styles.flexValue}>₹ 50</Text>
                    </View>
                    <View style={[styles.horizontalLine, { borderColor: '#E3E3E3' }]} />
                    <View style={styles.flexView}>
                        <Text style={styles.flexValueBold}>Net Earning</Text>
                        <Text style={styles.flexValueBold}>₹ 50</Text>
                    </View>
                </View>
            </ScrollView>

        </SafeAreaView>
    )
}


export default OrderSummary


const styles = StyleSheet.create({
    Container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    wrapper: {
        padding: 15,
        //marginBottom: responsiveHeight(1)
    },
    itemContainer: {
        flexDirection: 'row',
        //alignItems: 'center',
        paddingVertical: responsiveHeight(1.8),
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        borderStyle: 'dashed',
        // height: responsiveHeight(12),
        width: responsiveWidth(92),
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 50 / 2,
        marginRight: 10,
    },
    itemName: {
        color: '#1E2023',
        fontSize: responsiveFontSize(1.7),
        fontFamily: 'PlusJakartaSans-SemiBold'
    },
    textWithMargin: {
        marginBottom: responsiveHeight(0.5),
    },
    itemDetails: {
        color: '#5D6979',
        fontSize: responsiveFontSize(1.6),
        fontFamily: 'PlusJakartaSans-Medium'
    },
    itemDetailsValue: {
        color: '#8B939D',
        fontSize: responsiveFontSize(1.6),
        fontFamily: 'PlusJakartaSans-Medium'
    },
    itemTextContainer: {
        flex: 1,

    },
    headerText: {
        color: '#1E2023',
        fontSize: responsiveFontSize(2),
        fontFamily: 'PlusJakartaSans-SemiBold',
        marginVertical: responsiveHeight(2)
    },
    cardView: {
        height: responsiveHeight(22),
        width: responsiveWidth(91.5),
        backgroundColor: '#FFF',
        padding: 12,
        borderRadius: 12,
        marginBottom: responsiveHeight(1),
        ...Platform.select({
            android: {
                elevation: 5, // Only for Android
            },
            ios: {
                shadowColor: '#000', // Only for iOS
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 5,
            },
        }),
        marginHorizontal: 1
    },
    flexView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: responsiveHeight(0.6)
    },
    flexHeader: {
        color: '#8B939D',
        fontSize: responsiveFontSize(2),
        fontFamily: 'PlusJakartaSans-Regular',
    },
    flexValue: {
        color: '#1E2023',
        fontSize: responsiveFontSize(2),
        fontFamily: 'PlusJakartaSans-Regular',
    },
    flexValueBold: {
        color: '#1E2023',
        fontSize: responsiveFontSize(2),
        fontFamily: 'PlusJakartaSans-SemiBold',
    },
    horizontalLine: {
        borderWidth: 1,
        marginVertical: responsiveHeight(2),
    },
});
