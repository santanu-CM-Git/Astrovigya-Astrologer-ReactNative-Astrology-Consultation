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
import { withTranslation, useTranslation } from 'react-i18next';
const data = [
    { label: 'Today', value: '1' },
    { label: 'Yesterday', value: '2' },
    { label: 'This Week', value: '3' },
    { label: 'This Month', value: '4' },
    { label: 'Date Wise', value: '5' },
];

// const astrologerData = [
//     { id: '1', name: 'Cameron Williamson', amount: 100, date: '24-02-24, 09:30 PM', sessionTime: '8 Min', image: 'https://example.com/user1.jpg' },
//     { id: '2', name: 'Ronald Richards', amount: 200, date: '24-02-24, 09:30 PM', sessionTime: '8 Min', image: 'https://example.com/user2.jpg' },
//     { id: '3', name: 'Leslie Alexander', amount: 300, date: '24-02-24, 09:30 PM', sessionTime: '8 Min', image: 'https://example.com/user3.jpg' },
//     { id: '4', name: 'Eleanor Pena', amount: 500, date: '24-02-24, 09:30 PM', sessionTime: '8 Min', image: 'https://example.com/user4.jpg' },
// ];

const remediesData = [
    { id: '1', name: 'Akash Maurya', amount: 100, date: '24-02-24, 09:30 PM', remidiesType: 'Kal Sarp Dasha Remedies', sessionTime: '8 Min', image: 'https://example.com/user1.jpg' },
    { id: '2', name: 'Ramapati Tiwari', amount: 200, date: '24-02-24, 09:30 PM', remidiesType: 'Kal Sarp Dasha Remedies', sessionTime: '8 Min', image: 'https://example.com/user2.jpg' },
    { id: '3', name: 'Priti Singh', amount: 300, date: '24-02-24, 09:30 PM', remidiesType: 'Kal Sarp Dasha Remedies', sessionTime: '8 Min', image: 'https://example.com/user3.jpg' },
];

const renderAstrology = ({ item, navigation }) => (
    <View style={styles.itemContainer}>
        <Image source={userPhoto} style={styles.avatar} />
        <View style={styles.itemTextContainer}>
            <Text style={[styles.itemName, styles.textWithMargin]}>{item?.user?.full_name}</Text>
            <Text style={[styles.itemDetails, styles.textWithMargin]}>Date: <Text style={styles.itemDetailsValue}>{item.session_start_dt}</Text></Text>
            <Text style={styles.itemDetails}>Session Time: <Text style={styles.itemDetailsValue}>{Number(item?.total_session_time || 0).toFixed(2)} min</Text></Text>
            {item.cost != '0' ?
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: responsiveWidth(70) }}>
                    <Text style={styles.itemDetails}>Earning: <Text style={styles.itemDetailsValue}>{(Number(item.cost) - Number(item.platform_commision)).toFixed(2)}</Text></Text>
                    <Text style={styles.itemDetails}>Platform Fee: <Text style={styles.itemDetailsValue}>{Number(item.platform_commision).toFixed(2)}</Text></Text>
                </View> : null}
        </View>
        <View style={styles.itemImageContainer}>
            <Text style={styles.itemAmount}>₹{Number(item.cost).toFixed(2)}</Text>
            <View style={styles.tagView}>
                <Text style={styles.tagText}>{Number(item.cost) === 0 ? "Free" : "Paid"}</Text>
            </View>
            {/* <TouchableOpacity onPress={() => navigation.navigate('OrderSummary', { formPage: 'astro' })}>
                <Image
                    source={cardArrowImg}
                    style={styles.cardIconImg}
                />
            </TouchableOpacity> */}
        </View>
    </View>
);
const renderRemidies = ({ item, navigation }) => (
    <View style={styles.itemContainer}>
        <Image source={userPhoto} style={styles.avatar} />
        <View style={styles.itemTextContainer}>
            <Text style={[styles.itemName, styles.textWithMargin]}>{item?.user.full_name}</Text>
            <Text style={[styles.itemDetails, styles.textWithMargin]}>{item?.puja.name}</Text>
            <Text style={[styles.itemDetails, styles.textWithMargin]}>Date: <Text style={styles.itemDetailsValue}>{item?.puja_dates.date}</Text></Text>
            <Text style={styles.itemDetails}>Session Time: <Text style={styles.itemDetailsValue}>{moment(item?.puja_availability?.st, 'HH:mm:ss').format('hh:mm A')} - {moment(item?.puja_availability?.et, 'HH:mm:ss').format('hh:mm A')}</Text></Text>
        </View>
        <View style={styles.itemImageContainer}>
            <Text style={styles.itemAmount}>₹{Number(item?.transaction?.amount || 0).toFixed(2)}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('OrderSummary', { formPage: 'remedies', details: item })}>
                <Image
                    source={cardArrowImg}
                    style={styles.cardIconImg}
                />
            </TouchableOpacity>
        </View>
    </View>
);

const AstrologyTab = ({ navigation, astrologyData, lang }) => (
    <>
        {astrologyData.length != 0 ?
            <FlatList
                data={astrologyData}
                renderItem={({ item }) => renderAstrology({ item, navigation })}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
            />
            :
            <View style={{ flex: 1, alignItems: 'center', marginTop: responsiveHeight(10) }}>
                <Text style={styles.headerText}>{lang('Earnings.Nodatafound')}</Text>
            </View>
        }
    </>
);

const RemediesTab = ({ navigation, remediesData, lang }) => (
    <>
        {remediesData.length != 0 ?
            <FlatList
                data={remediesData}
                renderItem={({ item }) => renderRemidies({ item, navigation })}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
            />
            :
            <View style={{ flex: 1, alignItems: 'center', marginTop: responsiveHeight(10) }}>
                <Text style={styles.headerText}>{lang('Earnings.Nodatafound')}</Text>
            </View>
        }
    </>
);

const initialLayout = { width: Dimensions.get('window').width };

const EarningScreen = ({  }) => {
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
    const [earningSum, setEarningSum] = useState(0);
    const [platformFee, setPlatformFee] = useState(0);
    const [netEarning, setNetEarning] = useState(0)
    const [astrologerData, setastrologerData] = useState([])
    const [remediesData, setRemediesData] = useState([])

    const [index, setIndex] = React.useState(0);
    const [routes] = React.useState([
        { key: 'astrology', title: t('Earnings.Astrology') },
        { key: 'remedies', title: t('Earnings.Remedies') },
    ]);

    const [viewHeight, setViewHeight] = useState(responsiveHeight(150));

    useEffect(() => {
        if (astrologerData.length > 0) {
            setViewHeight(responsiveHeight(80 + astrologerData.length * 10)); // Dynamic height
        } else {
            setViewHeight(responsiveHeight(50)); // Default height if empty
        }
    }, [astrologerData]);

    const renderScene = ({ route, jumpTo }) => {
        switch (route.key) {
            case 'astrology':
                return <AstrologyTab navigation={navigation} astrologyData={astrologerData} lang={t} />;
            case 'remedies':
                return <RemediesTab navigation={navigation} remediesData={remediesData} lang={t} />;
            default:
                return null;
        }
    };

    const renderTabBar = props => (
        <TabBar
            {...props}
            indicatorStyle={styles.indicator}
            style={styles.tabBar}
            labelStyle={styles.label}
            inactiveColor='#8B939D'
            activeColor='#FB7401'
        />
    );
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
            const response = await axios.post(`${API_URL}/astrologer/astrologer-earnning`, option, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${userToken}`,
                    'Accept-Language': savedLang,
                },
            });

            console.log(JSON.stringify(response.data), 'response');

            if (response.data.response === true) {
                const res = response.data.data;
                setIsLoading(false);
                setEarningSum(response?.data?.main?.gross_earnning ? response.data.main.gross_earnning.toFixed(2) : "0.00");
                setPlatformFee(response?.data?.main?.platform_commission ? response.data.main.platform_commission.toFixed(2) : "0.00");
                setNetEarning(response?.data?.main?.net_earning ? response.data.main.net_earning.toFixed(2) : "0.00");
                setastrologerData(response?.data?.data)
                setRemediesData(response?.data?.puja)
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
            <CustomHeader commingFrom={'Earnings'} onPress={() => navigation.goBack()} title={t('Earnings.Earnings')} />
            <ScrollView style={styles.wrapper}>
                <View style={{ alignItems: 'center', marginBottom: responsiveHeight(3) }}>
                    <View style={styles.outerView}>
                        <View style={styles.insideView}>
                            {/* <Text style={styles.headerText}></Text> */}
                            <Text style={styles.priceText}>₹ {earningSum}</Text>
                            {/* moment().format('dddd, D MMMM') */}
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

                        <View style={styles.priceBreakdownView}>
                            <TouchableOpacity onPress={() => setBreakdownVisibility(!breakdownVisibility)}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text style={styles.earningText}>{t('Earnings.EarningBreakdown')}</Text>

                                    <Image
                                        source={breakdownVisibility ? ArrowUp : ArrowDown}
                                        style={{ height: 15, width: 15, resizeMode: 'contain' }}
                                    />

                                </View>
                            </TouchableOpacity>
                            {breakdownVisibility ?
                                <>
                                    <View
                                        style={styles.horizontalLine}
                                    />
                                    <View style={styles.earningItemView}>
                                        <Text style={styles.earningItemText}>{t('Earnings.GrossEarning')}</Text>
                                        <Text style={styles.earningItemText}>₹ {earningSum}</Text>
                                    </View>
                                    <View style={styles.earningItemView}>
                                        <Text style={styles.earningItemText}>{t('Earnings.PlatformFee')}</Text>
                                        <Text style={styles.earningItemText}>- ₹ {platformFee}</Text>
                                    </View>
                                    <View style={styles.earningItemView}>
                                        <Text style={styles.earningItemText}>{t('Earnings.NetPayable')}</Text>
                                        <Text style={styles.earningItemText}>₹ {netEarning}</Text>
                                    </View>
                                </> : null}
                        </View>

                    </View>
                    <View style={styles.buttonwrapper}>
                        <CustomButton
                            label={t('Earnings.WithdrawMoney')}
                            onPress={() => navigation.navigate('WithdrawScreen')}
                        />
                    </View>
                    <View style={{ width: responsiveWidth(92), height: viewHeight }}>
                        <TabView
                            key={index}
                            navigationState={{ index, routes }}
                            renderScene={({ route }) => renderScene({ route, navigation })}
                            renderTabBar={renderTabBar}
                            onIndexChange={setIndex}
                            initialLayout={initialLayout}
                        />
                    </View>
                </View>
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
                            <Text style={{ color: '#444', fontFamily: 'PlusJakartaSans-Medium', fontSize: responsiveFontSize(2) }}>Select your date</Text>
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
                                <CustomButton label={"Ok"} onPress={() => { dateRangeSearch() }} />
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    )
}


export default withTranslation()(EarningScreen)


const styles = StyleSheet.create({
    Container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    wrapper: {
        padding: 15,
        //marginBottom: responsiveHeight(1)
    },
    dropdown: {
        //height: responsiveHeight(4),
        //borderColor: 'gray',
        //borderWidth: 0.7,
        //borderRadius: 8,
        //paddingHorizontal: 8,

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
        height: 20,
        width: 20,
        resizeMode: 'contain'
    },
    outerView: {
        //height: responsiveHeight(45),
        marginTop: responsiveHeight(1),
        width: responsiveWidth(91),
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 12,
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
    insideView: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: responsiveHeight(2)
    },
    headerText: {
        color: '#FB7401',
        fontSize: responsiveFontSize(2),
        fontFamily: 'PlusJakartaSans-Medium'
    },
    priceText: {
        color: '#2D2D2D',
        fontSize: responsiveFontSize(3),
        fontFamily: 'PlusJakartaSans-Bold',
    },
    priceBreakdownView: {
        // height: responsiveHeight(25),
        width: '100%',
        backgroundColor: '#FEF3E5',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 12,
        marginTop: responsiveHeight(2)
    },
    earningText: {
        color: '#07273E',
        fontSize: responsiveFontSize(1.7),
        fontFamily: 'PlusJakartaSans-Medium'
    },
    horizontalLine: {
        borderBottomColor: '#E3E3E3',
        borderBottomWidth: 1,
        marginTop: 10
    },
    earningItemView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10
    },
    earningItemText: {
        color: '#746868',
        fontSize: responsiveFontSize(1.7),
        fontFamily: 'PlusJakartaSans-Regular'
    },
    earningItemTextBold: {
        color: '#444343',
        fontSize: responsiveFontSize(1.7),
        fontFamily: 'PlusJakartaSans-SemiBold'
    },
    singleEarningView: {
        width: responsiveWidth(91),
        backgroundColor: '#FFF',
        padding: 20,
        borderRadius: 20,
        marginTop: responsiveHeight(2),
        borderColor: '#F4F5F5',
        borderWidth: 2,
    },
    indexText: {
        color: '#444343',
        fontFamily: 'PlusJakartaSans-Medium',
        fontSize: responsiveFontSize(1.7),

    },
    paymentRecevedView: {
        height: responsiveHeight(5),
        width: responsiveWidth(78),
        marginTop: responsiveHeight(2),
        backgroundColor: '#F4F5F5',
        borderRadius: 15,
        padding: 5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    paymentIcon: {
        height: 20,
        width: 20,
        resizeMode: 'contain',
        marginRight: 5
    },
    paymentRecevedText: {
        color: '#2D2D2D',
        fontFamily: 'PlusJakartaSans-SemiBold',
        fontSize: responsiveFontSize(1.7)
    },
    statusText: {
        color: '#444343',
        fontSize: responsiveFontSize(1.7),
        fontFamily: 'PlusJakartaSans-SemiBold',
        marginLeft: responsiveWidth(1)
    },
    earningPersonName: {
        color: '#2D2D2D',
        fontSize: responsiveFontSize(2),
        fontFamily: 'PlusJakartaSans-Bold'
    },
    buttonwrapper: {
        width: responsiveWidth(92),
        marginVertical: responsiveHeight(2)
    },
    //tab section
    scene: {
        flex: 1,
    },
    tabBar: {
        backgroundColor: 'white',
    },
    indicator: {
        backgroundColor: '#FB7401',
    },
    label: {
        fontSize: responsiveFontSize(1.7),
        fontFamily: 'PlusJakartaSans-Bold',
        color: '#1E2023',
        textTransform: 'none',
    },
    listContent: {
        //paddingHorizontal: 16,
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
    itemTextContainer: {
        flex: 1,

    },
    itemImageContainer: {
        flexDirection: 'column',
        alignItems: 'flex-end'
    },
    itemName: {
        color: '#1E2023',
        fontSize: responsiveFontSize(1.7),
        fontFamily: 'PlusJakartaSans-SemiBold'
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
    itemAmount: {
        color: '#1E2023',
        fontSize: responsiveFontSize(1.7),
        fontFamily: 'PlusJakartaSans-Bold'
    },
    tagView: { backgroundColor: '#FEF3E5', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 15 },
    tagText: {
        fontSize: responsiveFontSize(1.7),
        color: '#FB7401',
        fontFamily: 'PlusJakartaSans-Regular'
    },
    cardIconImg: { height: 20, width: 20, resizeMode: 'contain', marginTop: responsiveHeight(2) },
    tabContentText: {
        fontSize: 18,
        color: 'black',
        textAlign: 'center',
        marginTop: 10,
    },
    textWithMargin: {
        marginBottom: responsiveHeight(0),
    },

});
