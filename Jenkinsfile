#!groovy
node {

    currentBuild.result = "SUCCESS"

    try {
        ansiColor('xterm') {

            notifyBuild('STARTED')

            stage('checkout') {
                echo 'ssh to the server'
                sh 'ssh moritz@fittshot.com'
                sh 'cd /var/lib/jenkins/jobs/fittshot-frontend-pipeline/workspace'
                echo 'git checkout'
                checkout([$class: 'GitSCM', branches: [[name: '*/master']], doGenerateSubmoduleConfigurations: false, extensions: [], submoduleCfg: [], userRemoteConfigs: [[credentialsId: 'MoritzGruber', url: 'https://github.com/MoritzGruber/Fashionapp-HdM-MWA']]])
            }

            stage('build') {
                echo 'install dependencies'
                sh 'npm install'
                sh 'bower install'
                echo 'Gulp: Minify & Uglify'
                sh 'gulp'
            }

            stage('tests: karma') {
                echo 'karma tests (not yet)'
                //sh 'karma start'
            }

            stage('deploy: production') {
                echo 'deploy to production'
                //sh 'cp /var/lib/jenkins/jobs/fittshot-frontend-pipeline /var/www/html'
            }
        }
    } catch(err) {
        currentBuild.result = "FAILED"
        throw err
    } finally {
        // Success or failure, always send notifications
        notifyBuild(currentBuild.result)
    }
}

def notifyBuild(String buildStatus = 'STARTED') {
  // build status of null means successful
  buildStatus =  buildStatus ?: 'SUCCESS'

  // Default values
  def colorName = 'RED'
  def colorCode = '#D00000'
  def subject = "${buildStatus}: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'"
  def summary = "${subject} (${env.BUILD_URL})"

  // Override default values based on build status
  if (buildStatus == 'STARTED') {
    color = 'YELLOW'
    colorCode = '#DAA038'
  } else if (buildStatus == 'SUCCESS') {
    color = 'GREEN'
    colorCode = '#36A64F'
  } else {
    color = 'RED'
    colorCode = '#D00000'
  }

  // Send notifications
  slackSend (color: colorCode, message: summary)
}
