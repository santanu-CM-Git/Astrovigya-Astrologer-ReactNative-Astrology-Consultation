import React, { useContext, useState, useEffect, useCallback } from 'react';
import { View, Text, SafeAreaView, StyleSheet, ScrollView, Dimensions, Image, Platform, Alert, FlatList } from 'react-native'
import CustomHeader from '../../components/CustomHeader'
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { cardArrowImg, chatInfoImg, dateIcon, timeIcon, userPhoto } from '../../utils/Images'
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomButton from '../../components/CustomButton'
import NoChatScreen from '../NoAuthScreen/NoChatScreen';
import NoCallScreen from '../NoAuthScreen/NoCallScreen';
import NoRemediesScreen from '../NoAuthScreen/NoRemediesScreen';
import moment from 'moment';
import axios from 'axios';
import Loader from '../../utils/Loader';
import { API_URL } from '@env'
import { useFocusEffect } from '@react-navigation/native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import SwitchSelector from "react-native-switch-selector";
import Tooltip from 'react-native-walkthrough-tooltip';
import { withTranslation, useTranslation } from 'react-i18next';

const renderConsultation = ({ item, navigation }) => (
    <View style={styles.chatItemWrapper}>
        <View style={styles.itemContainerForChat}>
            {/* <Image source={{ uri: item.image }} style={styles.avatar} /> */}
            {item?.astrologer?.profile_pic ?
                <Image source={{ uri: item?.astrologer?.profile_pic }} style={styles.avatar} />
                :
                <Image source={userPhoto} style={styles.avatar} />
            }
            <View style={styles.itemTextContainer}>
                <Text style={[styles.itemName, styles.textWithMargin]}>{item?.user?.full_name}</Text>
                <Text style={[styles.itemDetails, styles.textWithMargin]}>Date: <Text style={styles.itemDetailsValue}>{moment(item?.created_at).format('MMMM DD, YYYY hh:mm A')}</Text></Text>
                <Text style={styles.itemDetails}>Session Time: <Text style={styles.itemDetailsValue}>{Number(item?.total_session_time).toFixed(2)} Min</Text></Text>
            </View>
            <View style={styles.itemImageContainer}>
                <Text style={styles.itemAmount}>₹{item?.cost ? Number(item.cost).toFixed(2) : '0.00'}</Text>
                <Image
                    source={cardArrowImg}
                    style={styles.cardIconImg}
                />
            </View>
        </View>
        <TouchableOpacity style={[styles.joinNowButtonForCall, { marginTop: responsiveHeight(1), marginLeft: responsiveWidth(15) }]}
            onPress={() => { navigation.navigate('ChatHistory', { astrologerName: item?.astrologer?.display_name, astrologerId: item?.astrologer?.id, userId: item?.user?.id, Uid: item?.uuid, key: item?.uuid, }) }}
        >
            <Text style={styles.joinButtonTextForCall}>View Chat</Text>
        </TouchableOpacity>
    </View>
);

const renderRemedies = ({ item, index, activeTab, setActiveTab, tooltipVisible, setTooltipVisible }) => {

    return (
        <View>
            {activeTab === 'Upcoming' ? (
                <View style={styles.upcommingAppointmentView}>
                    <View style={styles.profileView}>
                        {item?.user?.profile_pic ?
                            <Image
                                source={{ uri: item?.user?.profile_pic }}
                                style={styles.profilePic}
                            /> :
                            <Image
                                source={userPhoto}
                                style={styles.profilePic}
                            />
                        }
                        <View style={{ flexDirection: 'column', marginLeft: responsiveWidth(1), width: responsiveWidth(58) }}>
                            <Text style={styles.nameText}>{item?.user?.full_name}</Text>
                            <Text style={styles.namesubText}>{item?.puja?.name}</Text>
                            <Text style={styles.namesubText}>Duration: <Text style={styles.hrsubtext}>{moment(item.puja_availability?.st, 'HH:mm:ss').format('hh:mm A')} - {moment(item.puja_availability?.et, 'HH:mm:ss').format('hh:mm A')}</Text></Text>
                            <Text style={styles.namesubText}>
                                Amount: <Text style={styles.hrsubtext}>₹{item?.transaction?.amount ? Number(item.transaction.amount).toFixed(2) : '0.00'}</Text>
                            </Text>
                        </View>
                        {/* <TouchableOpacity style={styles.joinNowButton}> */}
                        {/* <Text style={styles.joinButtonText}>Join Now</Text> */}
                        <Tooltip
                            isVisible={tooltipVisible === index}
                            content={<Text style={styles.namesubText}>Please check mail!</Text>}
                            placement="top"
                            onClose={() => setTooltipVisible(null)} // Hide tooltip when closed
                            arrowSize={{ width: 16, height: 8 }} // Customize arrow size
                            showChildInTooltip={false}
                        >
                            <TouchableOpacity onPress={() => setTooltipVisible(tooltipVisible === index ? null : index)}>
                                <Image
                                    source={chatInfoImg}
                                    style={styles.datetimeIcon}
                                />
                            </TouchableOpacity>
                        </Tooltip>

                        {/* </TouchableOpacity> */}
                    </View>
                    <View style={styles.dateTimeView}>
                        <View style={styles.dateView1}>
                            <Image
                                source={dateIcon}
                                style={styles.datetimeIcon}
                            />
                            <Text style={styles.dateTimeText}>{moment(item?.puja_dates?.date).format('dddd, DD MMMM, YYYY')}</Text>
                        </View>
                        {/* <View style={styles.dividerLine} /> */}
                        {/* <View style={styles.dateView2}>
                            <Image
                                source={timeIcon}
                                style={styles.datetimeIcon}
                            />
                            <Text style={styles.dateTimeText}>09:00 PM</Text>
                        </View> */}
                    </View>
                </View>

            ) : (
                <View style={styles.itemContainer}>
                    {/* <Image source={{ uri: item.image }} style={styles.avatar} /> */}
                    <Image source={userPhoto} style={styles.avatar} />
                    <View style={styles.itemTextContainer}>
                        <Text style={[styles.itemName, styles.textWithMargin]}>{item?.user?.full_name}</Text>
                        <Text style={[styles.itemDetails, styles.textWithMargin]}>{item?.puja?.name}</Text>
                        <Text style={[styles.itemDetails, styles.textWithMargin]}>Date: <Text style={styles.itemDetailsValue}>{moment(item?.puja_dates?.date).format('ddd, DD MMMM, YYYY')}</Text></Text>
                        <Text style={styles.itemDetails}>Session Time: <Text style={styles.itemDetailsValue}>{moment(item.puja_availability?.st, 'HH:mm:ss').format('hh:mm A')} - {moment(item.puja_availability?.et, 'HH:mm:ss').format('hh:mm A')}</Text></Text>
                    </View>
                    <View style={styles.itemImageContainer}>
                        <Text style={styles.itemAmount}>
                            ₹{item?.transaction?.amount ? Number(item.transaction.amount).toFixed(2) : '0.00'}
                        </Text>
                        {/* <Image
                            source={cardArrowImg}
                            style={styles.cardIconImg}
                        /> */}
                    </View>
                </View>
            )}
        </View>
    );
};

const renderScene = (activeTab, setActiveTab, tooltipVisible, setTooltipVisible, consultData, remediesDataUpcomming, remediesDataPrevious, t, navigation) => ({ route }) => {
    switch (route.key) {
        case 'first':
            return (
                <View>
                    {consultData.length !== 0 ? (
                        <View>
                            <FlatList
                                data={consultData}
                                renderItem={({ item }) => renderConsultation({ item, navigation })}
                                keyExtractor={(item) => item.id}
                                contentContainerStyle={{ paddingBottom: 20 }}
                            />
                        </View>
                    ) : (
                        // <NoChatScreen />
                        <View style={{ alignItems: 'center', marginTop: responsiveHeight(2) }}>
                            <Text style={styles.headerText}>{t('ClientManagement.Noconsultdatafound')}</Text>
                        </View>
                    )}
                </View>
            );
        case 'second':
            return (
                <View>
                    <View style={{ marginVertical: responsiveHeight(3) }}>
                        <SwitchSelector
                            initial={0}
                            onPress={value => setActiveTab(value)}
                            textColor={'#746868'}
                            selectedColor={'#894F00'}
                            buttonColor={'#FFFFFF'}
                            backgroundColor={'#FEF3E5'}
                            borderWidth={0}
                            height={responsiveHeight(5)}
                            valuePadding={6}
                            hasPadding
                            options={[
                                { label: t('ClientManagement.Upcoming'), value: "Upcoming" },
                                { label: t('ClientManagement.Previous'), value: "Previous" },
                            ]}
                        />
                    </View>
                    {activeTab === 'Upcoming' ? (
                        remediesDataUpcomming.length != '0' ?
                            <FlatList
                                data={remediesDataUpcomming}
                                renderItem={({ item, index }) => renderRemedies({ item, index, activeTab, setActiveTab, tooltipVisible, setTooltipVisible })}
                                keyExtractor={item => item.id}
                                contentContainerStyle={{ paddingBottom: 20 }}
                            />
                            :
                            // <NoRemediesScreen />
                            <View style={{ alignItems: 'center', }}>
                                <Text style={styles.headerText}>{t('ClientManagement.Noconsultdatafound')}</Text>
                            </View>
                    ) : (
                        remediesDataPrevious.length != '0' ?
                            <FlatList
                                data={remediesDataPrevious}
                                renderItem={({ item, index }) => renderRemedies({ item, index, activeTab, setActiveTab })}
                                keyExtractor={item => item.id}
                                contentContainerStyle={{ paddingBottom: 20 }}
                            />
                            :
                            // <NoRemediesScreen />
                            <View style={{ alignItems: 'center', }}>
                                <Text style={styles.headerText}>{t('ClientManagement.Noconsultdatafound')}</Text>
                            </View>
                    )

                    }
                </View>
            );
        default:
            return null;
    }
};
// const initialLayout = { width: Dimensions.get('window').width };

const ClientManagement = ({ navigation }) => {
    const { t, i18n } = useTranslation();
    const layout = Dimensions.get('window');
    const [isLoading, setIsLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('Upcoming');
    const [activeButtonNo, setActiveButtonNo] = useState(0);
    const [tooltipVisible, setTooltipVisible] = useState(null);

    const [consultData, setconsultData] = useState([
        { id: '1', name: 'Cameron Williamson', amount: 100, date: '24-02-24, 09:30 PM', sessionTime: '8 Min', image: 'https://example.com/user1.jpg' },
        { id: '2', name: 'Ronald Richards', amount: 200, date: '24-02-24, 09:30 PM', sessionTime: '8 Min', image: 'https://example.com/user2.jpg' },
        { id: '3', name: 'Leslie Alexander', amount: 300, date: '24-02-24, 09:30 PM', sessionTime: '8 Min', image: 'https://example.com/user3.jpg' },
        { id: '4', name: 'Eleanor Pena', amount: 500, date: '24-02-24, 09:30 PM', sessionTime: '8 Min', image: 'https://example.com/user4.jpg' },
    ])
    const [remediesDataUpcomming, setremediesDataUpcomming] = useState([])
    const [remediesDataPrevious, setremediesDataPrevious] = useState([])

    //pagination
    const [hasMore, setHasMore] = useState(true);
    const [perPage, setPerPage] = useState(10);
    const [pageno, setPageno] = useState(1);
    const [loading, setLoading] = useState(false);

    const [index, setIndex] = React.useState(0);
    const [routes] = React.useState([
        { key: 'first', title: t('ClientManagement.Consultation') },
        { key: 'second', title: t('ClientManagement.Remedies') },

    ]);
    const [viewHeight, setViewHeight] = useState(responsiveHeight(150));

    const handleLayout = (event) => {
        const { height } = event.nativeEvent.layout;
        if (height > 0) {
            setViewHeight(height);
        }
    };

    useEffect(() => {
        fetchUpcomingRemedies()
        fetchPreviousRemedies()
    }, []);
    useFocusEffect(
        React.useCallback(() => {
            fetchUpcomingRemedies()
            fetchPreviousRemedies()
        }, [])
    )

    useEffect(() => {
        fetchConsultHistory(pageno);
    }, [fetchConsultHistory, pageno]);

    useFocusEffect(
        useCallback(() => {
            setPageno(1);
            setHasMore(true); // Reset hasMore on focus
            fetchConsultHistory(1);
        }, [fetchConsultHistory])
    );


    const fetchUpcomingRemedies = async () => {
        try {
            const userToken = await AsyncStorage.getItem('userToken');
            const savedLang = await AsyncStorage.getItem('selectedLanguage');
            if (!userToken) {
                console.log('No user token found');
                setIsLoading(false);
                return;
            }
            const response = await axios.post(`${API_URL}/astrologer/puja-booked-history-upcomming`, {}, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${userToken}`,
                    'Accept-Language': savedLang,
                },
            });

            const responseData = response.data.data;

            console.log(responseData, 'fetchUpcomingRemedies')
            setremediesDataUpcomming(responseData)
            setIsLoading(false);

        } catch (error) {
            console.log(`Fetch puja history error: ${error}`);
            let myerror = error.response?.data?.message;
            Alert.alert('Oops..', error.response?.data?.message || 'Something went wrong', [
                { text: 'OK', onPress: () => myerror == 'Unauthorized' ? logout() : console.log('OK Pressed') },
            ]);
        } finally {
            setIsLoading(false);
        }
    }

    const fetchPreviousRemedies = async () => {
        try {
            const userToken = await AsyncStorage.getItem('userToken');
            const savedLang = await AsyncStorage.getItem('selectedLanguage');
            if (!userToken) {
                console.log('No user token found');
                setIsLoading(false);
                return;
            }
            const response = await axios.post(`${API_URL}/astrologer/puja-booked-history-previous`, {}, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${userToken}`,
                    'Accept-Language': savedLang,
                },
            });

            const responseData = response.data.data;

            console.log(responseData, 'fetchPreviousRemedies')
            setremediesDataPrevious(responseData)
            setIsLoading(false);

        } catch (error) {
            console.log(`Fetch puja history error: ${error}`);
            let myerror = error.response?.data?.message;
            Alert.alert('Oops..', error.response?.data?.message || 'Something went wrong', [
                { text: 'OK', onPress: () => myerror == 'Unauthorized' ? logout() : console.log('OK Pressed') },
            ]);
        } finally {
            setIsLoading(false);
        }
    }

    const fetchConsultHistory = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            const userToken = await AsyncStorage.getItem('userToken');
            const savedLang = await AsyncStorage.getItem('selectedLanguage');
            if (!userToken) {
                console.log('No user token found');
                setIsLoading(false);
                return;
            }
            const response = await axios.post(`${API_URL}/astrologer/session-history`, {}, {
                params: {
                    page
                },
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${userToken}`,
                    'Accept-Language': savedLang,
                },
            });

            const responseData = response.data.data.data;
            console.log(responseData, 'consult history')
            setconsultData(prevData => page === 1 ? responseData : [...prevData, ...responseData]);
            if (responseData.length === 0) {
                setHasMore(false); // No more data to load
            }
        } catch (error) {
            console.log(`Fetch consult history error: ${error}`);
            let myerror = error.response?.data?.message;
            Alert.alert('Oops..', error.response?.data?.message || 'Something went wrong', [
                { text: 'OK', onPress: () => myerror == 'Unauthorized' ? logout() : console.log('OK Pressed') },
            ]);
        } finally {
            setIsLoading(false);
            setLoading(false);
        }
    }, []);

    // **Adjust height based on data length**
    useEffect(() => {
        if (consultData.length > 0) {
            setViewHeight(responsiveHeight(80 + consultData.length * 15)); // Dynamic height
        } else {
            setViewHeight(responsiveHeight(50)); // Default height if empty
        }
    }, [consultData]);

    if (isLoading) {
        return (
            <Loader />
        )
    }


    return (
        <SafeAreaView style={styles.Container}>
            <CustomHeader commingFrom={'Earnings'} onPress={() => navigation.goBack()} title={t('ClientManagement.ClientManagement')} />
            <ScrollView style={styles.wrapper}>
                <View style={{ alignItems: 'center', marginBottom: responsiveHeight(3) }}>
                    <View style={{ width: responsiveWidth(92), height: viewHeight, }}>
                        <TabView
                            navigationState={{ index, routes }}
                            renderScene={renderScene(activeTab, setActiveTab, tooltipVisible, setTooltipVisible, consultData, remediesDataUpcomming, remediesDataPrevious, t, navigation)}
                            onIndexChange={setIndex}
                            initialLayout={{ width: layout.width }}
                            renderTabBar={props => (
                                <TabBar
                                    {...props}
                                    indicatorStyle={{ backgroundColor: '#FF9228', height: 4 }}
                                    style={{ backgroundColor: '#FFFFFF' }}
                                    activeColor='#FF9228'
                                    inactiveColor='#6A6A6A'
                                    labelStyle={{ textTransform: 'capitalize', fontSize: responsiveFontSize(2), fontWeight: '600' }}
                                />
                            )}
                        />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}


export default withTranslation()(ClientManagement)


const styles = StyleSheet.create({
    Container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    wrapper: {
        paddingHorizontal: 15,
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
    chatItemWrapper: {
        paddingVertical: responsiveHeight(1.8),
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        borderStyle: 'dashed',
    },
    itemContainer: {
        flexDirection: 'row',
        //alignItems: 'center',
        // height: responsiveHeight(12),
        paddingVertical: responsiveHeight(1.8),
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        borderStyle: 'dashed',
        width: responsiveWidth(92),
    },
    itemContainerForChat: {
        flexDirection: 'row',
        //alignItems: 'center',
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
    cardIconImg: { height: 20, width: 20, resizeMode: 'contain', marginTop: responsiveHeight(2) },
    tabContentText: {
        fontSize: 18,
        color: 'black',
        textAlign: 'center',
        marginTop: 10,
    },
    textWithMargin: {
        marginBottom: responsiveHeight(0.5),
    },
    joinNowButton: {
        height: responsiveHeight(4.5),
        marginLeft: responsiveWidth(2),
        backgroundColor: '#FB7401',
        borderColor: '#FB7401',
        borderWidth: 1,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        width: responsiveWidth(22)
    },
    joinButtonText: {
        fontFamily: 'PlusJakartaSans-Bold',
        color: '#FFF',
        fontSize: responsiveFontSize(1.7)
    },
    joinNowButtonForCall: {
        height: responsiveHeight(4.5),
        marginLeft: responsiveWidth(2),
        backgroundColor: '#FFF',
        borderColor: '#FB7401',
        borderWidth: 1,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        width: responsiveWidth(30)
    },
    joinButtonTextForCall: {
        fontFamily: 'PlusJakartaSans-Bold',
        color: '#FB7401',
        fontSize: responsiveFontSize(1.7)
    },
    upcommingAppointmentView: {
        //height: responsiveHeight(20),
        width: responsiveWidth(90),
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
        marginHorizontal: 5,
        marginVertical: 5
    },
    profileView: {
        flexDirection: 'row',
        //alignItems: 'center',

    },
    profilePic: { height: 50, width: 50, borderRadius: 50 / 2, marginBottom: 10, marginRight: 20 },
    nameText: {
        color: '#2D2D2D',
        fontSize: responsiveFontSize(2),
        fontFamily: 'PlusJakartaSans-Bold',
        marginBottom: 5,
    },
    namesubText: {
        color: '#1E2023',
        fontFamily: 'PlusJakartaSans-Medium',
        marginRight: 5,
        fontSize: responsiveFontSize(1.5),
        marginBottom: 5,
    },
    hrsubtext: {
        color: '#8B939D',
        fontFamily: 'PlusJakartaSans-Medium',
        fontSize: responsiveFontSize(1.5)
    },
    dateTimeView: {
        height: responsiveHeight(5),
        width: responsiveWidth(85),
        marginTop: responsiveHeight(2),
        backgroundColor: '#FEF3E5',
        borderColor: '#FEF3E5',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 10,
        //flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    dateView1: {
        flexDirection: 'row',
        alignItems: 'center',
        //width: responsiveWidth(40)
    },
    dateView2: {
        flexDirection: 'row',
        alignItems: 'center',
        width: responsiveWidth(40)
    },
    datetimeIcon: {
        height: 20,
        width: 20,
        resizeMode: 'contain',
        marginRight: responsiveWidth(2)
    },
    dateTimeText: {
        color: '#444343',
        fontFamily: 'PlusJakartaSans-SemiBold',
        fontSize: responsiveFontSize(1.5)
    },
    dividerLine: {
        height: '70%',
        width: 1,
        backgroundColor: '#FBEAD4',
        marginHorizontal: responsiveWidth(2)
    },
});
