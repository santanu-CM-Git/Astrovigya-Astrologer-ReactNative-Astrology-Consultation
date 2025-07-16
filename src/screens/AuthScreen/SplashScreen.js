import { useNavigation } from '@react-navigation/native';
import React, { useRef, useEffect } from 'react';
import {
    Image,
    View,
    StyleSheet,
    Dimensions,
    Animated,
    StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const SplashScreen = ({  }) => {
    const navigation = useNavigation();
    const windowHeight = Dimensions.get('window').height;
    const moveAnim = useRef(new Animated.Value(-windowHeight)).current; // Start from off-screen top
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.timing(moveAnim, {
                duration: 2000,
                toValue: windowHeight * 0.2 - 50, // Adjust the final position (50 is for centering the icon)
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, { 
                duration: 1000,
                toValue: 1,
                useNativeDriver: true,
            }), 
        ]).start();

        const timeout = setTimeout(() => {
            navigation.push('Onboarding');
        }, 5000);

        return () => clearTimeout(timeout);
    }, [moveAnim, fadeAnim]);

    return (
        <View style={styles.container}>
            <StatusBar translucent backgroundColor="transparent" />
            <LinearGradient
                colors={['#FFF9F1', '#FFF9F1', '#FFF9F1']} // Change these colors as needed
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.gradient}
            >
                <Animated.View style={[styles.logoContainer, { transform: [{ translateY: moveAnim }] }]}>
                    <Animated.Image
                        source={require('../../assets/images/icon.png')}
                        style={[styles.image, { opacity: fadeAnim }]}
                    />
                </Animated.View>
            </LinearGradient>
        </View>
    );
}; 

export default SplashScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    gradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: 100,
        height: 100,
        resizeMode: 'contain',
    },
    logoContainer: {
        // Optional: add styles if needed
    },
});
