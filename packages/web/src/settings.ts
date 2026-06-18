import { 
    Madeirense$Enumerators
} from "@Madeirense/shared";

import type {
    $Enums
} from "@Madeirense/database/browser";

// ***************************************************************************************************************

const AppSettings = {
    Routing: {
        protectedRoutes: [
            Madeirense$Enumerators.Pages.App.Order,
            Madeirense$Enumerators.Pages.App.Profile,
            Madeirense$Enumerators.Pages.BackOffice.Layout,
            Madeirense$Enumerators.Pages.Checkout.Layout,
        ],
        redirectionMap: {
            "Admin": Madeirense$Enumerators.Pages.BackOffice.Layout,
            "Customer": Madeirense$Enumerators.Pages.App.Layout,
            "Ghost": Madeirense$Enumerators.Pages.App["Not Found"],
            "Driver": Madeirense$Enumerators.Pages.BackOffice.Deliveries,
            "Staff": Madeirense$Enumerators.Pages.BackOffice.Requests,
            "System": Madeirense$Enumerators.Pages.BackOffice.Requests,
        } as Record<$Enums.Users_user_role, string>
    },
    UploadCare: {
        Overrides: {
            "update": {
                "thumbnail": {
                    "en": {
                        'locale-id': 'en',
                        'social-source-lang': 'en',
                        'upload-file': 'Update thumbnail',
                        'file__one': 'image',
                        'file__other': 'image',
                        'header-uploading': 'Updating {{count}} {{plural:file(count)}}',
                    },
                    "pt": {
                        'locale-id': 'en',
                        'social-source-lang': 'en',
                        'upload-file': 'Atualizar capa',
                        'file__one': 'imagem',
                        'file__other': 'imagens',
                        'header-uploading': 'A atualizar {{count}} {{plural:file(count)}}',
                    }
                },
                "video": {
                    "en": {
                        'locale-id': 'en',
                        'social-source-lang': 'en',
                        'upload-file': 'Upload replacement',
                        'file__one': 'video',
                        'file__other': 'videos',
                        'header-uploading': 'Updating {{count}} {{plural:file(count)}}',
                    },
                    "pt": {
                        'locale-id': 'en',
                        'social-source-lang': 'en',
                        'upload-file': 'Atualizar',
                        'file__one': 'vídeo',
                        'file__other': 'vídeos',
                        'header-uploading': 'A atualizar {{count}} {{plural:file(count)}}',
                    }
                }
            },
            "video": {
                "en": {
                    'locale-id': 'en',
                    'social-source-lang': 'en',
                    'upload-file': 'Upload video file',
                    'file__one': 'video',
                    'file__other': 'videos',
                    'header-uploading': 'Uploading {{count}} {{plural:file(count)}}',
                },
                "pt": {
                    'locale-id': 'en',
                    'social-source-lang': 'en',
                    'upload-file': 'Carregar vídeo',
                    'file__one': 'vídeo',
                    'file__other': 'vídeos',
                    'header-uploading': 'A carregar {{count}} {{plural:file(count)}}',
                }
            }
        }
    }
};

export default AppSettings;