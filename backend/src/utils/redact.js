function redactPersonalInfo(text) {
    const patterns = [
        { regex: /\b[\w.%+-]+@[\w.-]+\.[a-zA-Z]{2,}\b/g, tag: "<EMAIL>" },

        { regex: /\b\d{3}-\d{2}-\d{4}\b/g, tag: "<SSN>" },

        { regex: /\b(\+1\s?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, tag: "<PHONE>" },

        { regex: /\b(?:\d{4}[- ]?){3}\d{4}\b/g, tag: "<CREDIT_CARD>" },

        { regex: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g, tag: "<IP_ADDRESS>" },

        { regex: /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/g, tag: "<DATE>" },

        { regex: /\b\d{5}(-\d{4})?\b/g, tag: "<ZIP>" }
    ];

    for (const { regex, tag } of patterns) {
        text = text.replace(regex, tag);
    }

    return text;
}


module.exports = { redactPersonalInfo };

