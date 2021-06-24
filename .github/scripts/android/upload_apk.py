import os
from google.oauth2 import service_account
import googleapiclient.discovery
import os

BASE_DIR = "/".join(__file__.split("/")[:-1])

SERVICE_ACCOUNT_FILE = os.path.join(BASE_DIR, '../../secrets/android/2021-03-13-service-account.json')
APK_FILE = os.path.join(BASE_DIR, "../../../android/app/build/outputs/apk/release/app.apk")

TRACK = 'alpha'
PACKAGE_NAME = os.getenv("APP_PACKAGE")


def main():
    credentials = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE,
        scopes=['https://www.googleapis.com/auth/androidpublisher']
    )

    service = googleapiclient.discovery.build(
        'androidpublisher', 'v3', credentials=credentials
    )

    # Upload APK
    edit_request = service.edits().insert(body={}, packageName=PACKAGE_NAME)
    result = edit_request.execute()
    edit_id = result['id']

    apk_response = service.edits().apks().upload(
        editId=edit_id,
        packageName=PACKAGE_NAME,
        media_body=APK_FILE).execute()

    # Assign to track `alpha`
    track_response = service.edits().tracks().update(
        editId=edit_id,
        track=TRACK,
        packageName=PACKAGE_NAME,
        body={u'releases': [{
            u'name': u'Automated Alpha Deployment',
            u'versionCodes': [str(apk_response['versionCode'])],
            u'status': u'completed',
        }]}
    ).execute()

    service.edits().commit(
        editId=edit_id, packageName=PACKAGE_NAME).execute()


if __name__ == '__main__':
    main()
