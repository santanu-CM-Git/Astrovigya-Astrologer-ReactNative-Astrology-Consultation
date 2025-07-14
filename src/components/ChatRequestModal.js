import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import LinearGradient from 'react-native-linear-gradient';

const ChatRequestModal = ({ visible, onJoin, onReject, onClose, name, consultationType, image }) => {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalBackground}>
                <View style={styles.modalContainer}>
                    {/* <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Text style={styles.closeText}>X</Text>
                    </TouchableOpacity> */}
                    <LinearGradient
                        colors={['#FDEEDA', '#FEF7EF']} // Example colors, replace with your desired gradient
                        locations={[0, 1]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={styles.headingSection}
                    >
                        <Text style={styles.headerText}>Chat Request Received</Text>
                    </LinearGradient>
                    <View style={styles.profileContainer}>
                        {/* Add Image */}
                        <Image
                            source={{ uri: image }} // Replace with actual image URL or source
                            style={styles.profileImage}
                        />
                        <View style={{marginLeft: responsiveWidth(3)}}>
                            <Text style={styles.name}>{name}</Text>
                            {/* <Text style={styles.consultationType}>Consultation Type: {consultationType}</Text> */}
                        </View>
                    </View>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.joinButton} onPress={onJoin}>
                            <Text style={styles.buttonText}>Join Now</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.rejectButton} onPress={onReject}>
                            <Text style={styles.buttonText}>Reject</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        width: 300,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    closeButton: {
        alignSelf: 'flex-end',
        marginBottom: 10,
    },
    closeText: {
        fontSize: 18,
        color: '#333',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    profileContainer: {
        alignItems: 'center',
        marginBottom: 20,
        flexDirection: 'row',
        width: responsiveWidth(70),
        alignItems:'center'
    },
    profileImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    name: {
        fontSize: responsiveFontSize(2),
        fontFamily: 'PlusJakartaSans-SeniBold',
        color: '#1E2023'
    },
    consultationType: {
        fontSize: 14,
        color: 'gray',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    joinButton: {
        backgroundColor: '#FF7F00',
        padding: 10,
        borderRadius: 5,
        flex: 1,
        marginRight: 5,
        alignItems: 'center',
    },
    rejectButton: {
        backgroundColor: '#8B939D',
        padding: 10,
        borderRadius: 5,
        flex: 1,
        marginLeft: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontFamily: 'PlusJakartaSans-Bold',
        fontSize: responsiveFontSize(2),
    },
    headingSection: {
        height: responsiveHeight(5),
        width: responsiveWidth(60),
        alignSelf: 'center',
        borderRadius: 20,
        borderColor: '#FFE8C5',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: responsiveHeight(2)
    },
    headerText: {
        color: '#894F00',
        fontFamily: 'PlusJakartaSans-SeniBold',
        fontSize: responsiveFontSize(2),
    }
});

export default ChatRequestModal;
