four51.app.constant("RecipientUpload",{
    'FilePaths': {
        'Physical': 'https://www.four51.com/Themes/Custom/61a587a4-70db-45d4-a97a-5b54bef0d55a/Level 1/files/RecipientUploadTemplatePhysical.xlsx',
        'Digital': 'https://www.four51.com/Themes/Custom/61a587a4-70db-45d4-a97a-5b54bef0d55a/Level 1/files/RecipientUploadTemplateDigital.xlsx'
    },
    'Files': {
        'Physical': [
            {
                'Name': 'Recipient First Name',
                'Required': true,
                'Mapping': {
                    'Type': 'Spec',
                    'Data': 'FirstName'
                }
            },
            {
                'Name': 'Recipient Last Name',
                'Required': true,
                'Mapping': {
                    'Type': 'Spec',
                    'Data': 'LastName'
                }
            },
            {
                'Name': 'Recipient ID',
                'Required': true,
                'Mapping': {
                    'Type': 'Spec',
                    'Data': 'RecipientID'
                }
            },
            {
                'Name': 'Envelope Line Two',
                'Required': false,
                'Mapping': {
                    'Type': 'Spec',
                    'Data': 'EnvelopeLineTwo'
                }
            },
            {
                'Name': 'Ship To First Name',
                'Required': true,
                'Mapping': {
                    'Type': 'Address',
                    'Data': 'FirstName'
                }
            },
            {
                'Name': 'Ship To Last Name',
                'Required': true,
                'Mapping': {
                    'Type': 'Address',
                    'Data': 'LastName'
                }
            },
            {
                'Name': 'Company Name',
                'Required': true,
                'Mapping': {
                    'Type': 'Address',
                    'Data': 'CompanyName'
                }
            },
            {
                'Name': 'Street 1',
                'Required': true,
                'Mapping': {
                    'Type': 'Address',
                    'Data': 'Street1'
                }
            },
            {
                'Name': 'Street 2',
                'Required': true,
                'Mapping': {
                    'Type': 'Address',
                    'Data': 'Street2'
                }
            },
            {
                'Name': 'City',
                'Required': true,
                'Mapping': {
                    'Type': 'Address',
                    'Data': 'City'
                }
            },
            {
                'Name': 'State',
                'Required': true,
                'Mapping': {
                    'Type': 'Address',
                    'Data': 'State'
                }
            },
            {
                'Name': 'Zip',
                'Required': true,
                'Mapping': {
                    'Type': 'Address',
                    'Data': 'Zip'
                }
            },
            {
                'Name': 'Denomination',
                'Required': false,
                'Mapping': {
                    'Type': 'Spec',
                    'Data': 'Denomination'
                }
            },
            {
                'Name': 'Opening Message',
                'Required': false,
                'Mapping': {
                    'Type': 'Spec',
                    'Data': 'OpeningMessage'
                }
            },
            {
                'Name': 'Personal Message',
                'Required': false,
                'Mapping': {
                    'Type': 'Spec',
                    'Data': 'PersonalMessage'
                }
            },
            {
                'Name': 'Closing Message',
                'Required': false,
                'Mapping': {
                    'Type': 'Spec',
                    'Data': 'ClosingMessage'
                }
            }
        ],
        'Digital': [
            {
                'Name': 'Recipient First Name',
                'Required': true,
                'Mapping': {
                    'Type': 'Spec',
                    'Data': 'FirstName'
                }
            },
            {
                'Name': 'Recipient Last Name',
                'Required': true,
                'Mapping': {
                    'Type': 'Spec',
                    'Data': 'LastName'
                }
            },
            {
                'Name': 'Recipient ID',
                'Required': true,
                'Mapping': {
                    'Type': 'Spec',
                    'Data': 'RecipientID'
                }
            },
            {
                'Name': 'Email Address',
                'Required': true,
                'Mapping': {
                    'Type': 'Spec',
                    'Data': 'RecipientEmailAddress'
                }
            },
            {
                'Name': 'Denomination',
                'Required': false,
                'Mapping': {
                    'Type': 'Spec',
                    'Data': 'Denomination'
                }
            },
            {
                'Name': 'Opening Message',
                'Required': false,
                'Mapping': {
                    'Type': 'Spec',
                    'Data': 'OpeningMessage'
                }
            },
            {
                'Name': 'Personal Message',
                'Required': false,
                'Mapping': {
                    'Type': 'Spec',
                    'Data': 'PersonalMessage'
                }
            },
            {
                'Name': 'Closing Message',
                'Required': false,
                'Mapping': {
                    'Type': 'Spec',
                    'Data': 'ClosingMessage'
                }
            },
            {
                'Name': 'Email Subject',
                'Required': false,
                'Mapping': {
                    'Type': 'Spec',
                    'Data': 'EmailSubject'
                }
            },
            {
                'Name': 'Future Delivery Date (MM/DD/YYYY)',
                'Required': false,
                'Mapping': {
                    'Type': 'Spec',
                    'Data': 'FutureShipDate'
                }
            }
        ]
    }
});