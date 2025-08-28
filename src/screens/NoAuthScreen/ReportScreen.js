import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Image, Platform, Alert, FlatList } from 'react-native'
import CustomHeader from '../../components/CustomHeader'
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { ArrowDown, ArrowGratter, ArrowUp, GreenTick, Payment, RedCross, YellowTck, cardArrowImg, dateIcon, earningImg, notifyImg, ratingImg, rejectedImg, remediesImg, sessionImg, sessiontimeImg, timeIcon, userPhoto } from '../../utils/Images'
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
import LinearGradient from 'react-native-linear-gradient';
import { withTranslation, useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context'
const data = [
    { label: 'Today', value: '1' },
    { label: 'Yesterday', value: '2' },
    { label: 'This Week', value: '3' },
    { label: 'This Month', value: '4' },
    { label: 'Date Wise', value: '5' },
];


const ReportScreen = ({  }) => {
    const navigation = useNavigation();
    const { t, i18n } = useTranslation();
    const [isLoading, setIsLoading] = useState(false)
    const [value, setValue] = useState('1');
    const [isFocus, setIsFocus] = useState(false);
    const [breakdownVisibility, setBreakdownVisibility] = useState(false);
    const [isCalendarModalVisible, setCalendarModalVisible] = useState(false);
    const [markedDates, setMarkedDates] = useState({});
    const [startDay, setStartDay] = useState(null);
    const [endDay, setEndDay] = useState(null);
    const [totalEarning, setTotalEarning] = useState(0)
    const [noOfRemedies, setNoOfRemedies] = useState(0)
    const [noOfSession, setNoOfSession] = useState(0)
    const [totalSessionTime, setTotalSessionTime] = useState(0)
    const [overallRating, setOverallRating] = useState(0)


    useEffect(() => {
        setValue('1')
        fetchData("1")
    }, []);
    useFocusEffect(
        React.useCallback(() => {
            setValue('1')
            fetchData("1")
        }, [])
    )

    const toggleCalendarModal = () => {
        setCalendarModalVisible(!isCalendarModalVisible);
    }
    const handleDayPress = (day) => {
        if (startDay && !endDay) {
            const date = {}
            for (const d = moment(startDay); d.isSameOrBefore(day.dateString); d.add(1, 'days')) {
                //console.log(d,'vvvvvvvvvv')
                date[d.format('YYYY-MM-DD')] = {
                    marked: true,
                    color: 'black',
                    textColor: 'white'
                };

                if (d.format('YYYY-MM-DD') === startDay) {
                    date[d.format('YYYY-MM-DD')].startingDay = true;
                }
                if (d.format('YYYY-MM-DD') === day.dateString) {
                    date[d.format('YYYY-MM-DD')].endingDay = true;
                }
            }

            setMarkedDates(date);
            setEndDay(day.dateString);
        }
        else {
            setStartDay(day.dateString)
            setEndDay(null)
            setMarkedDates({
                [day.dateString]: {
                    marked: true,
                    color: 'black',
                    textColor: 'white',
                    startingDay: true,
                    endingDay: true
                }
            })
        }

    }

    const dateRangeSearch = () => {
        //console.log(startDay)
        //console.log(endDay)
        fetchData('5', startDay, endDay)
        toggleCalendarModal()
    }

    const fetchData = async (selectedValue, startDay, endDay) => {
        setIsLoading(true)
        let option = {};

        switch (selectedValue) {
            case '1':
                const currentDate = moment().format('YYYY-MM-DD');
                option = {
                    sdate: currentDate,
                    edate: currentDate,
                };
                break;
            case '2':
                const yesterdayDate = moment().subtract(1, 'days').format('YYYY-MM-DD');
                option = {
                    sdate: yesterdayDate,
                    edate: yesterdayDate,
                };
                break;
            case '3':
                const startOfWeek = moment().startOf('week').format('YYYY-MM-DD');
                const endOfWeek = moment().endOf('week').format('YYYY-MM-DD');
                option = {
                    sdate: startOfWeek,
                    edate: endOfWeek,
                };
                break;
            case '4':
                const startOfMonth = moment().startOf('month').format('YYYY-MM-DD');
                const endOfMonth = moment().endOf('month').format('YYYY-MM-DD');
                option = {
                    sdate: startOfMonth,
                    edate: endOfMonth,
                };
                break;
            case '5':
                option = {
                    sdate: startDay,
                    edate: endDay || startDay,
                };
                break;
            default:
                console.error('Invalid value');
        }
        console.log(option);

        try {
            const userToken = await AsyncStorage.getItem('userToken');
            const savedLang = await AsyncStorage.getItem('selectedLanguage');
            const response = await axios.post(`${API_URL}/astrologer/astrologer-reporting-counter`, option, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${userToken}`,
                    'Accept-Language': savedLang,
                },
            });

            console.log(JSON.stringify(response.data), 'response from report api');

            if (response.data.response === true) {
                const res = response.data.data;
                const minutes = res.duration_minutes;
                const hours = Math.floor(minutes / 60);
                const remainingMinutes = minutes % 60;
                // Format as hh:mm
                const formattedDuration = `${hours}:${remainingMinutes.toString().padStart(2, '0')}`;
                setIsLoading(false);
                setTotalEarning(res?.net_earning)
                setNoOfRemedies(res?.no_of_remedies)
                setNoOfSession(res?.no_of_session)
                setTotalSessionTime(formattedDuration)
                setOverallRating(res?.rating)
            } else {
                console.log('not okk');
                setIsLoading(false);
                Alert.alert('Oops..', "Something went wrong", [
                    { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                    { text: 'OK', onPress: () => console.log('OK Pressed') },
                ]);
            }
        } catch (e) {
            setIsLoading(false);
            console.error('Fetch error:', e);
            Alert.alert('Oops..', e.response?.data?.message, [
                { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                { text: 'OK', onPress: () => console.log('OK Pressed') },
            ]);
        }
    }

    if (isLoading) {
        return (
            <Loader />
        )
    }


    return (
        <SafeAreaView style={styles.Container}>
            <CustomHeader commingFrom={'Reports'} onPress={() => navigation.goBack()} title={t('Reports.Reports')} />
            <ScrollView style={styles.wrapper}>
                <View style={{ alignItems: 'center', marginBottom: responsiveHeight(1) }}>
                    <View style={styles.outerView}>
                        <View style={styles.insideView}>
                            <Text style={styles.headerText}>{t('Reports.Performance')}</Text>
                            <View style={{ width: responsiveWidth(27), }}>
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
                                        if (item.value === '5') {
                                            toggleCalendarModal();
                                        } else {
                                            fetchData(item.value);
                                        }
                                        setIsFocus(false);
                                    }}
                                />
                            </View>
                        </View>
                    </View>
                </View>
                <LinearGradient
                    colors={['#AEE1FF', '#DFF3FF']} // Dark on the left, light on the right
                    start={{ x: 0, y: 0.5 }} // Start point (left side)
                    end={{ x: 1, y: 0.5 }} // End point (right side)
                    style={styles.cardView}
                >
                    <View style={styles.cardContainer}>
                        <View style={styles.firstSection}>
                            <Text style={[styles.cardText, { color: '#0C496F' }]}>{t('Reports.TotalEarnings')}</Text>
                            <Text style={[styles.cardAmount, { color: '#1E2023' }]}>₹ {totalEarning.toFixed(2)}</Text>
                        </View>
                        <Image
                            source={earningImg}
                            style={styles.imageStyle}
                        />
                    </View>
                </LinearGradient>
                <LinearGradient
                    colors={['#FFD8A7', '#FEF3E5']} // Dark on the left, light on the right
                    start={{ x: 0, y: 0.5 }} // Start point (left side)
                    end={{ x: 1, y: 0.5 }} // End point (right side)
                    style={styles.cardView}
                >
                    <View style={styles.cardContainer}>
                        <View style={styles.firstSection}>
                            <Text style={[styles.cardText, { color: '#FB7401' }]}>{t('Reports.NoofRemedies')}</Text>
                            <Text style={[styles.cardAmount, { color: '#1E2023' }]}>{noOfRemedies}</Text>
                        </View>
                        <Image
                            source={remediesImg}
                            style={styles.imageStyle}
                        />
                    </View>
                </LinearGradient>
                <LinearGradient
                    colors={['#8CEFEA', '#D8FFFD']} // Dark on the left, light on the right
                    start={{ x: 0, y: 0.5 }} // Start point (left side)
                    end={{ x: 1, y: 0.5 }} // End point (right side)
                    style={styles.cardView}
                >
                    <View style={styles.cardContainer}>
                        <View style={styles.firstSection}>
                            <Text style={[styles.cardText, { color: '#057C76' }]}>{t('Reports.NoofSessions')}</Text>
                            <Text style={[styles.cardAmount, { color: '#1E2023' }]}>{noOfSession}</Text>
                        </View>
                        <Image
                            source={sessionImg}
                            style={styles.imageStyle}
                        />
                    </View>
                </LinearGradient>
                <LinearGradient
                    colors={['#B3F5C0', '#E5FFEB']} // Dark on the left, light on the right
                    start={{ x: 0, y: 0.5 }} // Start point (left side)
                    end={{ x: 1, y: 0.5 }} // End point (right side)
                    style={styles.cardView}
                >
                    <View style={styles.cardContainer}>
                        <View style={styles.firstSection}>
                            <Text style={[styles.cardText, { color: '#057C76' }]}>{t('Reports.TotalSessionTime')}</Text>
                            <Text style={[styles.cardAmount, { color: '#1E2023' }]}>{totalSessionTime} Hrs</Text>
                        </View>
                        <Image
                            source={sessiontimeImg}
                            style={styles.imageStyle}
                        />
                    </View>
                </LinearGradient>
                {/* <LinearGradient
                    colors={['#EBCCFF', '#F9EFFF']} // Dark on the left, light on the right
                    start={{ x: 0, y: 0.5 }} // Start point (left side)
                    end={{ x: 1, y: 0.5 }} // End point (right side)
                    style={styles.cardView}
                >
                    <View style={styles.cardContainer}>
                        <View style={styles.firstSection}>
                            <Text style={[styles.cardText, { color: '#39005F' }]}>Rejected Session</Text>
                            <Text style={[styles.cardAmount, { color: '#1E2023' }]}>02</Text>
                        </View>
                        <Image
                            source={rejectedImg}
                            style={styles.imageStyle}
                        />
                    </View>
                </LinearGradient> */}
                <LinearGradient
                    colors={['#F0F6A0', '#FCFEE5']} // Dark on the left, light on the right
                    start={{ x: 0, y: 0.5 }} // Start point (left side)
                    end={{ x: 1, y: 0.5 }} // End point (right side)
                    style={styles.cardView}
                >
                    <View style={styles.cardContainer}>
                        <View style={styles.firstSection}>
                            <Text style={[styles.cardText, { color: '#868F1C' }]}>{t('Reports.OverallRating')}</Text>
                            <Text style={[styles.cardAmount, { color: '#1E2023' }]}>{overallRating}</Text>
                        </View>
                        <Image
                            source={ratingImg}
                            style={styles.imageStyle}
                        />
                    </View>
                </LinearGradient>
            </ScrollView>
            <Modal
                isVisible={isCalendarModalVisible}
                style={{
                    margin: 0, // Add this line to remove the default margin
                    justifyContent: 'flex-end',
                }}>
                <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', height: 50, width: 50, borderRadius: 25, position: 'absolute', bottom: '75%', left: '45%', right: '45%' }}>
                    <Icon name="cross" size={30} color="#B0B0B0" onPress={toggleCalendarModal} />
                </View>
                <View style={{ height: '70%', backgroundColor: '#fff', position: 'absolute', bottom: 0, width: '100%' }}>
                    <View style={{ padding: 20 }}>
                        <View style={{ marginBottom: responsiveHeight(3) }}>
                            <Text style={{ color: '#444', fontFamily: 'PlusJakartaSans-Medium', fontSize: responsiveFontSize(2) }}>{t('Reports.Selectyourdate')}</Text>
                            <Calendar
                                onDayPress={(day) => {
                                    handleDayPress(day)
                                }}
                                //monthFormat={"yyyy MMM"}
                                //hideDayNames={false}
                                markingType={'period'}
                                markedDates={markedDates}
                                theme={{
                                    selectedDayBackgroundColor: '#417AA4',
                                    selectedDayTextColor: 'white',
                                    monthTextColor: '#417AA4',
                                    textMonthFontFamily: 'PlusJakartaSans-Medium',
                                    dayTextColor: 'black',
                                    textMonthFontSize: 18,
                                    textDayHeaderFontSize: 16,
                                    arrowColor: '#2E2E2E',
                                    dotColor: 'black'
                                }}
                                style={{
                                    borderWidth: 1,
                                    borderColor: '#E3EBF2',
                                    borderRadius: 15,
                                    height: responsiveHeight(50),
                                    marginTop: 20,
                                    marginBottom: 10
                                }}
                            />
                            <View style={styles.buttonwrapper2}>
                                <CustomButton label={t('Reports.Ok')} onPress={() => { dateRangeSearch() }} />
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    )
}


export default withTranslation()(ReportScreen)


const styles = StyleSheet.create({
    Container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    wrapper: {
        padding: 15,
        marginBottom: responsiveHeight(1)
    },
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
    imageStyle: {
        height: 70,
        width: 70,
        resizeMode: 'contain'
    },
    outerView: {
        //height: responsiveHeight(45),
        marginTop: responsiveHeight(0),
        width: responsiveWidth(91),
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
    cardView: {
        //width: responsiveWidth(92),
        height: responsiveHeight(15),
        borderRadius: 12,
        marginBottom: responsiveHeight(2)
    },
    cardContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        height: responsiveHeight(15),
    },
    firstSection: {
        flexDirection: 'column',
    },
    cardText: {
        fontSize: responsiveFontSize(2.2),
        fontFamily: 'PlusJakartaSans-SemiBold',
        marginVertical: 5
    },
    cardAmount: {
        fontSize: responsiveFontSize(3.5),
        fontFamily: 'PlusJakartaSans-Bold'
    }

});
