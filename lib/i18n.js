// Every user-facing string in the app lives here, in English and Hindi.
// Switching language on the homepage swaps this whole dictionary — it does
// not just change the AI-generated report, it changes every label, button,
// and error message too.

export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' },
];

export const DEFAULT_LANGUAGE = 'en';

const dict = {
  en: {
    brandName: 'Palmara',
    contactLabel: 'Contact',

    heroHeadline: 'Your palm and your birth details both have a story to tell.',
    heroSubtext:
      "Upload a photo of your open palm and share a few birth details — we read your hand's shape right in your browser and blend it with a personal reading, written just for you.",
    ctaPrimary: 'Get My Reading',

    howItWorksTitle: 'How it works',
    step1Title: 'Upload your palm',
    step1Text: "One clear photo. It's read privately in your browser — the photo never leaves your device.",
    step2Title: 'Share a few details',
    step2Text: 'Your name, date of birth, and place of birth (time too, if you know it).',
    step3Title: 'Get your reading',
    step3Text: 'A free preview first, then unlock your full personal report.',

    uploadIdle: 'Tap to upload a photo of your open palm',
    uploadDifferent: 'Upload a different photo',
    uploadRetry: 'Try again — tap to upload',
    statusDetecting: 'Reading your palm...',
    statusReading: 'Writing your reading...',
    errorTooSmall: 'That photo is too small to read clearly. Please retake it closer up, in good light.',
    errorNoHand:
      "We couldn't clearly find a hand in that photo. Lay your palm flat, fill the frame, and make sure it's well lit, then try again.",
    errorConfused: 'Something about that photo confused our detector — please try a different angle.',
    errorGeneric: 'Something went wrong reading that photo. Please try again.',

    formTitle: 'A few details for your reading',
    formSubtitle: 'We use these only to personalize your reading.',
    nameLabel: 'Full name',
    namePlaceholder: 'e.g. Priya Sharma',
    dobLabel: 'Date of birth',
    timeLabel: 'Time of birth',
    timeUnknownLabel: "I don't know my exact birth time",
    placeLabel: 'Place of birth',
    placePlaceholder: 'e.g. Jaipur, Rajasthan',
    formSubmit: 'Get My Reading',
    formBack: 'Back',
    formError: 'Please fill in your name, date of birth, and place of birth.',

    yourHandLabel: 'Your hand:',
    lockedHint: 'The rest of your reading is ready — unlock it to keep reading.',
    priceOriginal: '₹599',
    priceFinal: '₹99',
    unlockButton: 'Unlock My Full Reading',
    payButtonLoading: 'Opening checkout...',
    payErrorStart: 'Could not start payment — please try again.',
    payErrorFailed: 'Payment failed — please try again.',
    payErrorVerify: 'Payment succeeded but unlocking failed — refresh and contact us with your payment ID.',
    reportForLabel: 'Reading for',
    pdfReadyTitle: 'Your full reading is ready.',
    pdfReadyText: "We've put it together as a keepsake PDF you can download and keep.",
    downloadPdfButton: 'Download Your Reading (PDF)',
    generatingPdf: 'Preparing your PDF...',
    pdfError: 'Could not prepare your PDF — please try again.',

    upsellTitle: 'Curious when your Mahadasha begins?',
    upsellText:
      "Every life runs through bigger planetary cycles. Leave your details and we'll let you know the moment a Mahadasha reading is ready for you.",
    upsellNamePlaceholder: 'Your name',
    upsellContactPlaceholder: 'Phone or email',
    upsellSubmit: 'Notify Me',
    upsellThanks: "Thanks — we'll be in touch.",
    upsellError: 'Something went wrong — please try again.',

    honesty:
      "Being upfront: Palmara classifies your hand into one of four traditional palmistry shapes from real, measured proportions, and blends it with a reflective reading based on the birth details you share. It's a traditional practice turned into a fun, thoughtful moment — not scientifically validated fortune telling.",
  },

  hi: {
    brandName: 'पाल्मारा',
    contactLabel: 'संपर्क करें',

    heroHeadline: 'आपकी हथेली और आपकी जन्म-कुंडली, दोनों की अपनी एक कहानी है।',
    heroSubtext:
      'अपनी खुली हथेली की एक फ़ोटो अपलोड करें और कुछ जन्म-विवरण साझा करें — हम आपकी हथेली का आकार आपके ब्राउज़र में ही पढ़ते हैं और उसे आपके लिए ख़ास तौर पर लिखी गई एक व्यक्तिगत रीडिंग के साथ जोड़ते हैं।',
    ctaPrimary: 'मेरी रीडिंग पाएं',

    howItWorksTitle: 'यह कैसे काम करता है',
    step1Title: 'अपनी हथेली अपलोड करें',
    step1Text: 'एक स्पष्ट फ़ोटो। यह आपके ब्राउज़र में निजी तौर पर पढ़ी जाती है — फ़ोटो कभी आपकी डिवाइस से बाहर नहीं जाती।',
    step2Title: 'कुछ विवरण साझा करें',
    step2Text: 'आपका नाम, जन्म तिथि, और जन्म स्थान (यदि पता हो तो जन्म समय भी)।',
    step3Title: 'अपनी रीडिंग पाएं',
    step3Text: 'पहले एक मुफ़्त झलक, फिर अपनी पूरी व्यक्तिगत रिपोर्ट अनलॉक करें।',

    uploadIdle: 'अपनी खुली हथेली की फ़ोटो अपलोड करने के लिए टैप करें',
    uploadDifferent: 'दूसरी फ़ोटो अपलोड करें',
    uploadRetry: 'फिर से कोशिश करें — अपलोड करने के लिए टैप करें',
    statusDetecting: 'आपकी हथेली पढ़ी जा रही है...',
    statusReading: 'आपकी रीडिंग लिखी जा रही है...',
    errorTooSmall: 'यह फ़ोटो साफ़ पढ़ने के लिए बहुत छोटी है। कृपया पास से, अच्छी रोशनी में दोबारा फ़ोटो लें।',
    errorNoHand:
      'हमें उस फ़ोटो में हाथ साफ़ नहीं दिखा। अपनी हथेली सीधी रखें, फ़्रेम में पूरी आने दें, और सुनिश्चित करें कि रोशनी अच्छी हो, फिर दोबारा कोशिश करें।',
    errorConfused: 'उस फ़ोटो में कुछ ऐसा था जिससे हमारा डिटेक्टर उलझ गया — कृपया दूसरे कोण से कोशिश करें।',
    errorGeneric: 'वह फ़ोटो पढ़ते समय कुछ गड़बड़ हो गई। कृपया दोबारा कोशिश करें।',

    formTitle: 'आपकी रीडिंग के लिए कुछ विवरण',
    formSubtitle: 'इनका उपयोग केवल आपकी रीडिंग को व्यक्तिगत बनाने के लिए किया जाएगा।',
    nameLabel: 'पूरा नाम',
    namePlaceholder: 'जैसे प्रिया शर्मा',
    dobLabel: 'जन्म तिथि',
    timeLabel: 'जन्म समय',
    timeUnknownLabel: 'मुझे अपना सटीक जन्म समय नहीं पता',
    placeLabel: 'जन्म स्थान',
    placePlaceholder: 'जैसे जयपुर, राजस्थान',
    formSubmit: 'मेरी रीडिंग पाएं',
    formBack: 'वापस',
    formError: 'कृपया अपना नाम, जन्म तिथि, और जन्म स्थान भरें।',

    yourHandLabel: 'आपकी हथेली:',
    lockedHint: 'आपकी बाकी रीडिंग तैयार है — आगे पढ़ने के लिए इसे अनलॉक करें।',
    priceOriginal: '₹599',
    priceFinal: '₹99',
    unlockButton: 'मेरी पूरी रीडिंग अनलॉक करें',
    payButtonLoading: 'चेकआउट खोला जा रहा है...',
    payErrorStart: 'भुगतान शुरू नहीं हो सका — कृपया दोबारा कोशिश करें।',
    payErrorFailed: 'भुगतान विफल हो गया — कृपया दोबारा कोशिश करें।',
    payErrorVerify: 'भुगतान सफल रहा लेकिन अनलॉक नहीं हो पाया — पेज रीफ़्रेश करें और अपनी पेमेंट आईडी के साथ हमसे संपर्क करें।',
    reportForLabel: 'रीडिंग — के लिए',
    pdfReadyTitle: 'आपकी पूरी रीडिंग तैयार है।',
    pdfReadyText: 'हमने इसे एक यादगार PDF के रूप में तैयार किया है जिसे आप डाउनलोड करके रख सकते हैं।',
    downloadPdfButton: 'अपनी रीडिंग डाउनलोड करें (PDF)',
    generatingPdf: 'आपकी PDF तैयार की जा रही है...',
    pdfError: 'आपकी PDF तैयार नहीं हो सकी — कृपया दोबारा कोशिश करें।',

    upsellTitle: 'जानना चाहते हैं आपकी महादशा कब शुरू होती है?',
    upsellText:
      'हर जीवन बड़े ग्रह-चक्रों से होकर गुज़रता है। अपना विवरण छोड़ें, और महादशा रीडिंग तैयार होते ही हम आपको बताएंगे।',
    upsellNamePlaceholder: 'आपका नाम',
    upsellContactPlaceholder: 'फ़ोन या ईमेल',
    upsellSubmit: 'मुझे सूचित करें',
    upsellThanks: 'धन्यवाद — हम जल्द ही संपर्क करेंगे।',
    upsellError: 'कुछ गड़बड़ हो गई — कृपया दोबारा कोशिश करें।',

    honesty:
      'साफ़ बात: पाल्मारा आपके हाथ को वास्तविक, मापे गए अनुपातों से चार पारंपरिक हस्तरेखा आकारों में से एक में वर्गीकृत करता है, और उसे आपके साझा किए गए जन्म-विवरण पर आधारित एक भावपूर्ण रीडिंग के साथ जोड़ता है। यह एक पारंपरिक प्रथा है जिसे एक सुखद, विचारशील पल बनाया गया है — वैज्ञानिक रूप से प्रमाणित भविष्यवाणी नहीं।',
  },
};

export function t(language, key) {
  const lang = dict[language] ? language : DEFAULT_LANGUAGE;
  return dict[lang][key] ?? dict[DEFAULT_LANGUAGE][key] ?? key;
}

export default dict;
