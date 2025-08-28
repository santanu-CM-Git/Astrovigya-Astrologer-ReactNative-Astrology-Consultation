import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Image, Platform, Alert, Button, Pressable, TouchableWithoutFeedback, FlatList } from 'react-native'
import CustomHeader from '../../components/CustomHeader'
import CustomButton from '../../components/CustomButton';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { ArrowGratter, GreenTick, SessionIcon, availabilityIconFocusedImg, dateIcon, deleteImg, dotIcon, editColorIcon, plus, timeIcon } from '../../utils/Images'
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
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { TouchableOpacity } from 'react-native';
import { withTranslation, useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context'
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
const AvailabilityScreen = ({ }) => {
    const navigation = useNavigation();
    const { t, i18n } = useTranslation();
    const [isLoading, setIsLoading] = useState(false)
    const [value, setValue] = useState('');
    const [isFocus, setIsFocus] = useState(false);

    const [availability, setAvailability] = useState({});
    const [activeSections, setActiveSections] = useState([0]);
    const [collapsed, setCollapsed] = useState(true);

    const [modalVisible, setModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [startTime, setStartTime] = useState(new Date());
    const [endTime, setEndTime] = useState(new Date());
    const [isStartPickerVisible, setStartPickerVisibility] = useState(false);
    const [isEndPickerVisible, setEndPickerVisibility] = useState(false);

    const openEditModal = (item) => {
        setSelectedItem(item);
        setStartTime(moment(item.startTime, 'hh:mm A').toDate());
        setEndTime(moment(item.endTime, 'hh:mm A').toDate());
        setModalVisible(true);
    };

    const handleSaveTime = async () => {
        if (selectedItem) {
            const updatedAvailability = { ...availability };
            const pujaType = Object.keys(availability).find(key =>
                availability[key].includes(selectedItem)
            );
            if (pujaType) {
                const itemIndex = updatedAvailability[pujaType].indexOf(selectedItem);
                updatedAvailability[pujaType][itemIndex].startTime = moment(startTime).format('hh:mm A');
                updatedAvailability[pujaType][itemIndex].endTime = moment(endTime).format('hh:mm A');
                setAvailability(updatedAvailability);
            }
        }
        console.log(availability, 'availabilityavailabilityavailabilityavailability');
        await submitAvailability();
        setModalVisible(false);
    };


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
            <View style={{ width: responsiveWidth(80) }}>
                <Text style={styles.headerText}>{section}</Text>
            </View>
            <Icon name={isActive ? "keyboard-arrow-down" : "keyboard-arrow-right"} size={24} color="#FF8A00" />
        </View>
    );

    const renderContent = section => (
        <View style={styles.contentContainer}>
            {availability[section].length ? (
                availability[section].map((item, index) => (
                    <View key={index} style={styles.itemContainerColumn}>
                        <View style={styles.itemContainer}>
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
                                    if (!value) {
                                        deleteAvailability(item.puja_availability_id);
                                    }
                                }}
                                thumbColor={item.available ? "#FF8A00" : "#f4f3f4"} // Thumb color when switch is on or off
                                trackColor={{ false: "#767577", true: "#FFDDC1" }}  // Track color when switch is on or off
                                ios_backgroundColor="#3e3e3e" // Background color on iOS when the switch is off
                                style={styles.switchStyle}
                            />
                        </View>
                        {item.available ?
                            <View style={styles.itemContainer1st}>
                                <View style={styles.roundShape}>
                                    <Image
                                        source={SessionIcon}
                                        style={styles.dateIcon}
                                    />
                                    <Text style={styles.itemTextColor}>
                                        {item.startTime && item.endTime
                                            ? `${item.startTime} - ${item.endTime}`
                                            : 'Time not set yet'}
                                    </Text>
                                </View>
                                <TouchableOpacity onPress={() => openEditModal(item)}>
                                    <Image
                                        source={editColorIcon}
                                        style={[styles.dateIcon, { marginLeft: responsiveWidth(2) }]}
                                    />
                                </TouchableOpacity>
                            </View> : null}
                        <View
                            style={{
                                borderBottomColor: '#E3E3E3',
                                borderBottomWidth: StyleSheet.hairlineWidth,
                                marginVertical: responsiveHeight(2)
                            }}
                        />
                    </View>
                ))
            ) : (
                <Text style={styles.noDatesText}>No available dates</Text>
            )}

        </View>
    );

    const submitAvailability = async () => {
        AsyncStorage.getItem('userToken', async (err, usertoken) => {
            //console.log(selectedItem, "kkkkkkkkkkk")
            const savedLang = await AsyncStorage.getItem('selectedLanguage');
            const option = {
                "puja_id": selectedItem.puja_id,
                "puja_date_id": selectedItem.puja_date_id,
                "date": selectedItem.actualDate,
                "st": moment(selectedItem.startTime, 'hh:mm A').format('HH:mm:ss'),
                "et": moment(selectedItem.endTime, 'hh:mm A').format('HH:mm:ss')
            }
            //console.log(option);

            axios.post(`${API_URL}/astrologer/set-availabilities`, option, {
                headers: {
                    "Authorization": `Bearer ${usertoken}`,
                    "Content-Type": 'application/json',
                    'Accept-Language': savedLang,
                },
            })
                .then(res => {
                    setIsLoading(false);
                    console.log(res.data, 'fetch availability')
                    Toast.show({
                        type: 'success',
                        text1: '',
                        text2: res.data.message,
                        position: 'top',
                        topOffset: Platform.OS == 'ios' ? 55 : 20
                    });
                    fetchAvailability()
                })
                .catch(e => {
                    console.log(`astrologer-availability submit error ${e}`)
                    console.log(e.response?.data?.message)
                });
        });
    }

    const fetchAvailability = async (argValue) => {
        AsyncStorage.getItem('userToken', async (err, usertoken) => {
            const savedLang = await AsyncStorage.getItem('selectedLanguage');
            const value = moment().format('MMMM');

            console.log(argValue, '1111');
            console.log(value, '22222');

            const currentMonth = argValue ? argValue : value;
            const currentYear = moment().year(); // Get the current year

            // Get start and end of the specified month
            const currentMonthStart = moment(`${currentMonth} ${currentYear}`, 'MMMM YYYY').startOf('month').format('YYYY-MM-DD');
            const currentMonthEnd = moment(`${currentMonth} ${currentYear}`, 'MMMM YYYY').endOf('month').format('YYYY-MM-DD');
            console.log('Start Date:', currentMonthStart);
            console.log('End Date:', currentMonthEnd);

            const option = {
                "s_date": currentMonthStart,
                "e_date": currentMonthEnd
            }
            console.log(option);

            axios.post(`${API_URL}/astrologer/availabilities`, option, {
                headers: {
                    "Authorization": `Bearer ${usertoken}`,
                    "Content-Type": 'application/json',
                    'Accept-Language': savedLang,
                },
            })
                .then(res => {
                    setIsLoading(false);
                    console.log(res.data.data, 'fetch availability')
                    // Transform the API response
                    const transformedData = {};
                    res.data.data.forEach(item => {
                        const pujaName = item.consultation.name; // Puja name
                        const pujaDates = item.puja_dates || []; // Puja dates

                        transformedData[pujaName] = pujaDates.map(date => ({
                            date: moment(date.date).format('ddd DD, YYYY'), // Format the date
                            actualDate: date.date,
                            puja_id: date.puja_id, // Puja ID
                            puja_date_id: date.id, // Puja Date ID
                            available: date.puja_availability !== null, // Set availability to true
                            startTime: date.puja_availability?.st ? moment(date.puja_availability.st, "HH:mm:ss").format("hh:mm A") : null, // Format start time to AM/PM
                            endTime: date.puja_availability?.et ? moment(date.puja_availability.et, "HH:mm:ss").format("hh:mm A") : null,  // Format end time to AM/PM
                            puja_availability_id: date.puja_availability?.id
                        }));
                    });

                    console.log(transformedData, 'Transformed Availability Data');
                    setAvailability(transformedData)

                })
                .catch(e => {
                    console.log(`astrologer-availability error ${e}`)
                    console.log(e.response?.data?.message)
                });
        });
    }

    const deleteAvailability = (id) => {
        AsyncStorage.getItem('userToken', async (err, usertoken) => {
            //console.log(selectedItem, "kkkkkkkkkkk")
            const savedLang = await AsyncStorage.getItem('selectedLanguage');
            const option = {
                "puja_availability_id": id,
            }
            //console.log(option);

            axios.post(`${API_URL}/astrologer/delete-availabilities`, option, {
                headers: {
                    "Authorization": `Bearer ${usertoken}`,
                    "Content-Type": 'application/json',
                    'Accept-Language': savedLang,
                },
            })
                .then(res => {
                    setIsLoading(false);
                    console.log(res.data, 'delete availability')
                    Toast.show({
                        type: 'success',
                        text1: '',
                        text2: res.data.message,
                        position: 'top',
                        topOffset: Platform.OS == 'ios' ? 55 : 20
                    });
                    fetchAvailability()
                })
                .catch(e => {
                    console.log(`astrologer-availability delete error ${e}`)
                    console.log(e.response?.data?.message)
                });
        });

    }

    useEffect(() => {
        const currentMonth = moment().format('MMMM');
        console.log(currentMonth);
        setValue(currentMonth)
        fetchAvailability()

    }, [])



    useFocusEffect(
        React.useCallback(() => {
            fetchAvailability()
        }, [])
    )


    if (isLoading) {
        return (
            <Loader />
        )
    }

    return (
        <SafeAreaView style={styles.Container}>
            <CustomHeader commingFrom={'Availability'} onPress={() => navigation.goBack()} title={t('Availability.Availability')} />
            <ScrollView style={styles.wrapper}>
                <View style={{ alignItems: 'center', marginBottom: responsiveHeight(1) }}>
                    <View style={styles.outerView}>
                        <View style={styles.insideView}>
                            <Text style={styles.headerText}>{t('Availability.SetYourAvailability')}</Text>
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
                                        console.log(item.value)
                                        fetchAvailability(item.value)
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
                <Modal
                    visible={modalVisible}
                    animationType="slide"
                    transparent
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Edit Time</Text>
                            <View style={styles.timePickerContainer}>
                                <Text style={styles.headingText}>Start Time</Text>
                                <TouchableOpacity onPress={() => setStartPickerVisibility(true)}>
                                    <View style={styles.timeInput}>
                                        <Text style={styles.headingText}>{moment(startTime).isValid() ? moment(startTime).format('hh:mm A') : 'Enter Time'}</Text>
                                    </View>

                                </TouchableOpacity>

                            </View>
                            <View style={styles.timePickerContainer}>
                                <Text style={styles.headingText}>End Time</Text>
                                <TouchableOpacity onPress={() => setEndPickerVisibility(true)}>
                                    <View style={styles.timeInput}>
                                        <Text style={styles.headingText}>{moment(endTime).isValid() ? moment(endTime).format('hh:mm A') : 'Enter Time'}</Text>
                                    </View>
                                </TouchableOpacity>

                            </View>
                            {/* Start Time Picker Modal */}
                            <DateTimePickerModal
                                isVisible={isStartPickerVisible}
                                mode="time"
                                onConfirm={(selectedTime) => {
                                    setStartPickerVisibility(false);
                                    setStartTime(selectedTime);
                                }}
                                onCancel={() => setStartPickerVisibility(false)}
                            />

                            {/* End Time Picker Modal */}
                            <DateTimePickerModal
                                isVisible={isEndPickerVisible}
                                mode="time"
                                onConfirm={(selectedTime) => {
                                    setEndPickerVisibility(false);
                                    setEndTime(selectedTime);
                                }}
                                onCancel={() => setEndPickerVisibility(false)}
                            />

                            <CustomButton label="Save" onPress={handleSaveTime} />
                            <CustomButton label="Cancel" onPress={() => setModalVisible(false)} buttonColor={'gray'} />
                        </View>
                    </View>
                </Modal>
            </ScrollView>
            {/* <View style={styles.buttonwrapper}>
                <CustomButton
                    label="Save Availability"
                    onPress={() => submitAvailability()}
                />
            </View> */}
        </SafeAreaView>
    )
}


export default withTranslation()(AvailabilityScreen)


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
        fontFamily: 'PlusJakartaSans-SemiBold',
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
    },
    itemContainerColumn: {
        flexDirection: 'column',
        justifyContent: 'space-between',

    },
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    itemContainer1st: {
        width: responsiveWidth(50),
        flexDirection: 'row',
        alignItems: 'center'
    },
    dateIcon: {
        height: 20,
        width: 20,
        resizeMode: 'contain',
        marginRight: responsiveWidth(2)
    },
    itemTextColor: {
        fontSize: responsiveFontSize(1.7),
        fontFamily: 'PlusJakartaSans-Medium',
        color: '#FB7401',
    },
    itemText: {
        fontSize: responsiveFontSize(1.7),
        fontFamily: 'PlusJakartaSans-Medium',
        color: '#1E2023',
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
        alignSelf: 'center'
    },

    modalContainer: {
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        height: responsiveHeight(100),
        width: '110%',
        alignSelf: 'center'
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 20,
        marginHorizontal: 20,
        borderRadius: 10,
    },
    modalTitle: {
        fontSize: responsiveFontSize(2),
        fontFamily: 'PlusJakartaSans-Bold',
        marginBottom: 20,
        color: '#000'
    },
    timePickerContainer: {
        marginBottom: 20,
    },
    headingText: {
        fontSize: responsiveFontSize(1.7),
        fontFamily: 'PlusJakartaSans-Medium',
        color: '#000',
    },
    timeInput: {
        width: responsiveWidth(77),
        height: responsiveHeight(6),
        borderColor: '#DAE0EA',
        borderWidth: 1,
        backgroundColor: '#F2F4F6',
        borderRadius: 6,
        paddingLeft: 10,
        justifyContent: 'center',
        marginTop: responsiveHeight(1)
    },
    roundShape: {
        flexDirection: 'row',
        padding: 5,
        paddingHorizontal: 10,
        borderRadius: 20,
        backgroundColor: '#FEF3E5'
    },
    switchStyle: {
        ...Platform.select({
            ios: {
                transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }]  // Adjust scale values as needed
            },
            android: {
                transform: [{ scaleX: 1.3 }, { scaleY: 1.3 }]  // Adjust scale values as needed
            }
        })
    }
});
