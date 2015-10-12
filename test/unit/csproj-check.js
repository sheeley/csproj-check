import cpCheck from '../../src/csproj-check'

describe('cpCheck', () => {
  describe('Check csproj files', () => {
    it('should return -1 when file does not exist', (done) => {
      cpCheck.runCheck('./nonexistant.csproj', (errorCount) => {
        expect(errorCount).to.be.equal(-1)
        done()
      })
    })

    it('should pass a good csproj', (done) => {
      cpCheck.runCheck('./test/unit/pass.csproj', function(errorCount) {

        expect(errorCount).to.be.equal(0)
        done()
      })
    })

    it('should fail a bad csproj', (done) => {
      cpCheck.runCheck('./test/unit/fail.csproj', (errorCount) => {
        expect(errorCount).to.be.equal(1)
        done()
      })
    })

    it('should fail the directory when a file fails', (done) => {
      cpCheck.runCheck('**/*.csproj', (errorCount) => {
        expect(errorCount).to.be.equal(1)
        done()
      })
    })
  })
})
