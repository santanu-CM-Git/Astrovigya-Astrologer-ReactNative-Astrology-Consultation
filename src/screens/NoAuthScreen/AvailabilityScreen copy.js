import React, { useContext, useState, useEffect } from 'react';
import { View, Text, SafeAreaView, StyleSheet, ScrollView, Switch, Image, Platform, Alert, Button, Pressable, TouchableWithoutFeedback, FlatList } from 'react-native'
import CustomHeader from '../../components/CustomHeader'
import CustomButton from '../../components/CustomButton';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { ArrowGratter, GreenTick, availabilityIconFocusedImg, dateIcon, deleteImg, dotIcon, plus, timeIcon } from '../../utils/Images'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Modal from "react-native-modal";
import moment from 'moment-timezone';
import * as Animatable from 'react-native-animatable';
import Collapsible from 'react-native-collapsible';
import Accordion from 'react-native-collapsible/Accordion';
import { Dropdown } from 'react-native-element-dropdown';
import axios from 'axios';
import { API_URL } from '@env'
import Toast from 'react-native-toast-message';
import Loader from '../../utils/Loader';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
const data = [
    { label: 'January', value: 'January' },
    { label: 'February', value: 'February' },
    { label: 'March', value: 'March' },
    { label: 'April', value: 'April' },
    { label: 'May', value: 'May' },
    { label: 'June', value: 'June' },
    { label: 'July', value: 'July' },
    { label: 'August', value: 'August' },
    { label: 'September', value: 'September' },
    { label: 'October', value: 'October' },
    { label: 'November', value: 'November' },
    { label: 'December', value: 'December' },
];
const AvailabilityScreen = ({  }) => {
    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState(false)
    const [value, setValue] = useState('');
    const [isFocus, setIsFocus] = useState(false);

    const [availability, setAvailability] = useState({
        'Kali Puja': [
            { date: 'Mon 12, 2024',puja_id: 1, available: true },
            { date: 'Wed 19, 2024',puja_id: 1, available: true },
            { date: 'Fri 26, 2024',puja_id: 1, available: false },
        ],
        'Laxmi Narayan Puja': [
            { date: 'Mon 12, 2024',puja_id: 2, available: true },
            { date: 'Wed 19, 2024',puja_id: 2, available: true },
            { date: 'Fri 26, 2024',puja_id: 2, available: false },
        ],
        'Rudrabhishekam Puja': [],
        'Durga Puja': [
            { date: 'Mon 12, 2024',puja_id: 4, available: true },
            { date: 'Wed 19, 2024',puja_id: 4, available: true },
            { date: 'Fri 26, 2024',puja_id: 4, available: false },
        ],
        'Ganesh Puja': [
            { date: 'Mon 12, 2024',puja_id: 5, available: true },
            { date: 'Wed 19, 2024',puja_id: 5, available: true },
            { date: 'Fri 26, 2024',puja_id: 5, available: false },
        ],
    });
    const [activeSections, setActiveSections] = useState([]);
    const [collapsed, setCollapsed] = useState(true);

    const toggleExpanded = () => {
        setCollapsed(!collapsed);
    };
    const NoTouchableFeedback = ({ onPress, children }) => (
        <TouchableWithoutFeedback onPress={onPress}>
            <View>
                {children}
            </View>
        </TouchableWithoutFeedback>
    );

    const renderHeader = (section, _, isActive) => (
        <View style={styles.headerContainer}>
            <Text style={styles.headerText}>{section}</Text>
            <Icon name={isActive ? "keyboard-arrow-down" : "keyboard-arrow-right"} size={24} color="#FF8A00" />
        </View>
    );

    const renderContent = section => (
        <View style={styles.contentContainer}>
            {availability[section].length ? (
                availability[section].map((item, index) => (
                    <View key={index} style={styles.itemContainer}>
                        <View style={styles.itemContainer1st}>
                            <Image
                                source={availabilityIconFocusedImg}
                                style={styles.dateIcon}
                            />
                            <Text style={styles.itemText}>{item.date}</Text>
                        </View>
                        <Switch
                            value={item.available}
                            onValueChange={value => {
                                const updatedAvailability = { ...availability };
                                updatedAvailability[section][index].available = value;
                                setAvailability(updatedAvailability);
                            }}
                            thumbColor={item.available ? "#FF8A00" : "#f4f3f4"} // Thumb color when switch is on or off
                            trackColor={{ false: "#767577", true: "#FFDDC1" }}  // Track color when switch is on or off
                            ios_backgroundColor="#3e3e3e" // Background color on iOS when the switch is off
                        />
                    </View>
                ))
            ) : (
                <Text style={styles.noDatesText}>No available dates</Text>
            )}
        </View>
    );

    const submitAvailability = () => {

    }

    useEffect(() => {
        const currentMonth = moment().format('MMMM');
        console.log(currentMonth);
        setValue(currentMonth)
    }, [])
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
            <CustomHeader commingFrom={'Availability'} onPress={() => navigation.goBack()} title={'Availability'} />
            <ScrollView style={styles.wrapper}>
                <View style={{ alignItems: 'center', marginBottom: responsiveHeight(1) }}>
                    <View style={styles.outerView}>
                        <View style={styles.insideView}>
                            <Text style={styles.headerText}>Set Your Availability</Text>
                            <View style={{ width: responsiveWidth(30), }}>
                                <Dropdown
                                    style={[styles.dropdown]}
                                    placeholderStyle={styles.placeholderStyle}
                                    selectedTextStyle={styles.selectedTextStyle}
                                    inputSearchStyle={styles.inputSearchStyle}
                                    itemTextStyle={styles.selectedTextStyle}
                                    data={data}
                                    //search
                                    maxHeight={300}
                                    labelField="label"
                                    valueField="value"
                                    placeholder={!isFocus ? 'Select item' : '...'}
                                    searchPlaceholder="Search..."
                                    value={value}
                                    onFocus={() => setIsFocus(true)}
                                    onBlur={() => setIsFocus(false)}
                                    onChange={item => {
                                        setValue(item.value);
                                        // if (item.value === '5') {
                                        //     toggleCalendarModal();
                                        // } else {
                                        //      fetchData(item.value);
                                        // }
                                        // setIsFocus(false);
                                    }}
                                />
                            </View>
                        </View>
                    </View>
                </View>
                <Accordion
                    sections={Object.keys(availability)}
                    activeSections={activeSections}
                    renderHeader={renderHeader}
                    renderContent={renderContent}
                    touchableComponent={NoTouchableFeedback}
                    onChange={setActiveSections}
                />

            </ScrollView>
            <View style={styles.buttonwrapper}>
                <CustomButton
                    label="Save Availability"
                    onPress={() => submitAvailability()}
                />
            </View>
        </SafeAreaView>
    )
}


export default AvailabilityScreen


const styles = StyleSheet.create({
    Container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    wrapper: {
        padding: 15,
        //marginBottom: responsiveHeight(1)
    },
    outerView: {
        //height: responsiveHeight(45),
        marginTop: responsiveHeight(0),
        width: responsiveWidth(100),
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 12,
    },
    insideView: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: responsiveHeight(2)
    },
    headerText: {
        color: '#1E2023',
        fontSize: responsiveFontSize(2),
        fontFamily: 'PlusJakartaSans-SemiBold'
    },
    // dropdown start
    dropdown: {
        height: responsiveHeight(4),
        borderColor: '#E3E3E3',
        borderWidth: 0.7,
        borderRadius: 12,
        paddingHorizontal: 8,

    },
    placeholderStyle: {
        fontSize: responsiveFontSize(1.7),
        color: '#746868',
        fontFamily: 'PlusJakartaSans-Regular'
    },
    selectedTextStyle: {
        fontSize: responsiveFontSize(1.7),
        color: '#746868',
        fontFamily: 'PlusJakartaSans-Regular'
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 16,
        color: '#746868',
        fontFamily: 'PlusJakartaSans-Regular'
    },
    // dropdown end
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 12,
        backgroundColor: '#FFF7F2',
        borderRadius: 8,
        marginVertical: 4,
    },
    contentContainer: {
        paddingHorizontal: 16,
        backgroundColor: '#FFFFFF',
        marginBottom: responsiveHeight(3),
        marginHorizontal: 8,
        marginTop: 8,
        borderRadius: 8,
        paddingVertical: 8,
        elevation: 2,
    },
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    itemContainer1st: {
        width: responsiveWidth(40),
        flexDirection: 'row'
    },
    dateIcon: {
        height: 20,
        width: 20,
        resizeMode: 'contain',
        marginRight: responsiveWidth(2)
    },
    itemText: {
        fontSize: responsiveFontSize(1.7),
        fontFamily: 'PlusJakartaSans-Medium',
        color: '#333',
    },
    noDatesText: {
        fontSize: 14,
        color: '#666',
        paddingVertical: 8,
        textAlign: 'center',
    },
    buttonwrapper: {
        width: responsiveWidth(92),
        marginVertical: responsiveHeight(1),
        alignSelf:'center'
    },
});
