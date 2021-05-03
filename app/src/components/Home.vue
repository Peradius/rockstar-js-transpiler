<template>
  <div>

    <div class="textarea-form">
      <div style="width:50%; display:inline-block;">
        <span>Rockstar Input</span>
        
        <br>
        <textarea v-model.lazy="rockstarValue" placeholder="Put your Rockstar code here"></textarea>
      </div>

      <div style="width:50%; display:inline-block;">
        <span>Javascript Output</span>
        
        <br>
        <textarea v-model.lazy="jsValue" disabled placeholder="Click on the translate button below to see the results"></textarea>
      </div>
    </div>

    <div>
      <button class="execButton" @click="executeAction(rockstarValue)">Transform</button>
      <p v-if="errorVal !== undefined" class="errorText">{errorVal}</p>
    </div>

  </div>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      rockstarValue: "",
      jsValue: "",
      errorVal: undefined
    }
  },
  methods: {
    executeAction: function(inputText) {
      if(this.validate(inputText)) {
        this.jsValue = this.transform(inputText);
        this.errorVal = undefined;
      } else {
        this.jsValue = '';
        this.errorVal = 'Error occured';
      }
    },

    validate: function(inputText) {
      // Put your validation function here

      console.log('I should validate here based on ' + inputText);
      return true;
    },

    transform: function(inputText) {
      // Put your transformation function here

      let stringArray = inputText.split("");
      let reversedArray = stringArray.reverse();
      let outputString = reversedArray.join("");

      return outputString;
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .textarea-form {
    font-family: Consolas, "Courier New", Courier, monospace;
    color: #fff;
    font-size: 1.2em;
    margin-top: 1em;
    margin-bottom: 1em;
  }

  .textarea-form textarea {
    resize: none;
    overflow:scroll;
    overflow-x: hidden;
    height: 200px;
    width: 50%;
    display: inline-block;

    font-family: Consolas, "Courier New", Courier, monospace;
    line-height: 1.2em;
    padding: 8px;
    box-sizing: border-box;
    font-size: 0.9em;
    border: 1px solid #fff;
    background-color: #000;
    color: #fff;
  }

  .execButton {
    background-color: #000;
    color: #fff;
    font-weight: bold;
    border: 3px solid #fff;
    font-size: 140%;
    border-radius: 8px;
    margin: 8px auto;
  }

  .execButton:hover {
    background-color: #600;
    color: #fff;
    font-size: 140%;
  }

  .errorText {
    color: red;
  }
  
</style>
