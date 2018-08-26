from django.apps import AppConfig

class PlayerConfig(AppConfig):
    name = 'player'

    def ready(self):
        import gazelistener
        import threading
        # Thread for listening
        thread = threading.Thread(target=gazelistener.gazelistener)
        thread.daemon = True # TODO: check here if something does not work with gaze acquisition
        thread.start()
