const Project = {
    data() {
      return {
        listState: {
            English: [
                {
                    label: 'Save by extensions',
                    value: 'save_by_extensions',
                },
                {
                    label: 'Save to the selected folder',
                    value: 'save_to_folder',
                },
                {
                    label: 'Save by file type',
                    value: 'save_by_file_type'
                }
            ],
            Russian: [
                {
                    label: 'Сохранять по расширениям',
                    value: 'save_by_extensions',
                },
                {
                    label: 'Сохранять в выбранную папку',
                    value: 'save_to_folder',
                },
                {
                    label: 'Сохранять по типу файла',
                    value: 'save_by_file_type'
                }
            ],
        },
        lang: 'English',
        activeState: 'save_by_extensions',
        pathToFolderForFilter: '',
        pathTpFolderToFilter: '',
        startButton: 'Start filter files',
        startedProgram: false,
        timer: null,
        error: false,
        
        startLabel: {
            English: 'Start filter files',
            Russian: 'Начать фильтрацию файлов'
        },
        workingLabel: {
            English: 'Program is working..',
            Russian: 'Программа работает..'
        },
        problemLabel: {
            English: 'Some problem, try again..',
            Russian: 'Какая то проблема, попытайся снова..'
        },
        stopLabel: {
            English: 'Stop',
            Russian: 'Остановить'
        },
        title: {
            English: 'File Filter',
            Russian: 'Фильтер файлов'
        },
        helpers: {
            filterType: {
                English: 'You can choose how to filter files.',
                Russian: 'Ты можешь выбрать как фильтровать файлы.'
            },
            pathToFolderForFilter: {
                English: 'You need to put the path to the folder you want to filter.',
                Russian: 'Тебе нужно вставить путь к папке которую ты хочешь фильтровать.'
            },
            pathToFoderWhereSave: {
                English: 'Insert a link to the folder to save to.',
                Russian: 'Вставь путь к папке куда сохранять.'
            }
        }
      }
    },
    methods: {
        handleChangeLang(lang) {
            this.lang = lang;
        },
        handleChangeSelect(state) {
            this.activeState = state;
        },
        disabledStartButton() {
            const isCorrectPath = Boolean(this.pathToFolderForFilter);

            if (this.activeState === 'save_to_folder') {
                if (!this.pathTpFolderToFilter) {
                    return true;
                }
            }
            
            return !isCorrectPath;
        },
        async handleClickStop() {
            this.startButton = this.startLabel[this.lang]
            this.startedProgram = false
            this.error = false
            await eel.stop_app()();
        },
        async handleClickStart() {
            try {
                this.startButton = this.workingLabel[this.lang]
                this.startedProgram = true
                this.error = false

                const isSaveToFolder = this.activeState === 'save_to_folder'
                const isSaveByType = this.activeState === 'save_by_file_type'

                await eel.start_file_setter(this.pathToFolderForFilter, this.pathTpFolderToFilter, isSaveToFolder, isSaveByType)();
            } catch (e) {
                this.startButton = this.problemLabel[this.lang]
                this.startedProgram = false
                this.error = true
                await eel.stop_app()();
            }
        },
        saveToStotage() {
            localStorage.setItem('state', JSON.stringify({
                activeState: this.activeState,
                pathToFolderForFilter: this.pathToFolderForFilter,
                pathTpFolderToFilter: this.pathTpFolderToFilter
            }))
        }
    },
    computed: {
        activeStateLabel() {
            return this.listState[this.lang].find(item => item.value === this.activeState)?.label;
        }
    },
    watch: {
        activeState() {
            if (this.activeState !== 'save_to_folder') {
                this.pathTpFolderToFilter = null;
            }

            this.saveToStotage()
        },
        pathToFolderForFilter() {
            this.saveToStotage()
        },
        pathTpFolderToFilter() {
            this.saveToStotage()
        },
        lang() {
            if (this.error) {
                this.startButton = this.problemLabel[this.lang]
            } else if (this.startedProgram) {
                this.startButton = this.workingLabel[this.lang]
            } else {
                this.startButton = this.startLabel[this.lang]
            }

            localStorage.setItem('lang', this.lang)
        }
    },
    mounted() {
        const state = localStorage.getItem('state');
        const lang = localStorage.getItem('lang')

        if (lang) this.lang = lang;

        if (state) {
            const data = JSON.parse(state);
            this.activeState = data.activeState || this.activeState
            this.pathToFolderForFilter = data.pathToFolderForFilter || this.pathToFolderForFilter;
            this.pathTpFolderToFilter = data.pathTpFolderToFilter || this.pathTpFolderToFilter;
        }
    },
  }
  
  Vue.createApp(Project).mount('#app')
