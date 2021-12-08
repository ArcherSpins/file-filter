from watchdog.observers import Observer
import os
import time
import random
import eel
import contextlib

from watchdog.events import FileSystemEventHandler

musics = ['aac', 'mp3', 'wma', 'flac', 'ogg']
videos = [
    '3g2', '3gp', '3gp2', '3gpp', '3gpp2', 
    'asf', 'asx', 'avi', 'bin', 'dat', 'drv', 
    'f4v', 'flv', 'gtp', 'h264', 'm4v', 'mkv', 
    'mod', 'moov', 'mov', 'mp4', 'mpeg', 'mpg', 
    'mts', 'rm', 'rmvb', 'spl', 
    'srt', 'stl', 'swf', 'ts', 'vcd', 'vid', 
    'vid', 'vid', 'vob', 'webm', 'wm', 'wmv', 'yuv'
]


class PausingObserver(Observer):
    def dispatch_events(self, *args, **kwargs):
        if not getattr(self, '_is_paused', False):
            super(PausingObserver, self).dispatch_events(*args, **kwargs)

    def pause(self):
        self._is_paused = True

    def resume(self):
        time.sleep(self.timeout)
        self.event_queue.queue.clear()
        self._is_paused = False

    @contextlib.contextmanager
    def stop_listen(self):
        self.pause()

observer = PausingObserver()

@eel.expose
def start_file_setter(folder_track, folder, intoFolder = False, byTypeFile = False):
    folder_dest = folder or folder_track
    
    class Handler(FileSystemEventHandler):
        def on_modified(self, event):
            for filename in os.listdir(folder_track):
                if os.path.isfile(filename):
                    ext = filename.split('.')
                    file = folder_track + "/" + filename
                    new_path = ''
                    
                    if intoFolder:
                        new_path = folder_dest
                    
                    
                    elif byTypeFile:
                        if len(ext) > 1:
                            if ext[1].lower() == 'jpg' or ext[1].lower() == 'png' or ext[1].lower() == 'svg' or ext[1].lower() == 'jpeg':
                                new_path = folder_dest + "/images"
                            elif ext[1].lower() == 'doc' or ext[1].lower() == 'docx' or ext[1].lower() == 'pdf':
                                new_path = folder_dest + "/documents"
                            elif ext[1].lower() == 'txt':
                                new_path = folder_dest + "/texts"
                            elif ext[1].lower() in musics:
                                new_path = folder_dest + "/musics"
                            elif ext[1].lower() in videos:
                                new_path = folder_dest + "/videos"
                            elif ext[1].lower() == 'exe' or ext[1].lower() == 'dll' or ext[1].lower() == 'dmg' or ext[1].lower() == 'sh' or ext[1].lower() == 'deb':
                                new_path = folder_dest + "/downloaders"
                            elif ext[1].lower() == 'zip' or ext[1].lower() == 'rar':
                                new_path = folder_dest + "/archives"
                            else:
                                new_path = folder_dest + "/other"
                                
                    else:
                        if len(ext) > 1:
                            new_path = folder_dest + "/" + ext[1].lower()
                            
                    if len(new_path) == 0:
                        new_path = 'incorrect-files'
                        
                    try:
                        os.mkdir(new_path)
                    except OSError:
                        pass
                    
                    for element in os.scandir(new_path):
                        if element.is_file():
                            if element.name == filename:
                                filename = ext[0] + str(random.random()) + "." + ext[1].lower()
                                break
                    
                    os.rename(file, new_path + "/" + filename)


    handle = Handler()
    observer.schedule(handle, folder_track, recursive=False)

    observer.start()
    
    return True

def new_observer():
    global observer
    observer = PausingObserver()

@eel.expose
def stop_app():
    observer.stop()
    observer.join()
    new_observer()
    return True

eel.init('./web')
eel.start('main.html', size=(800, 500))