<template>
  <div class="textarea-form">
    <div style="width:50%; display:inline-block;">
      <span>Rockstar Input</span>
      
      <p style="white-space: pre-line;">Hello: {{ rockstarValue }}</p>
      <br>
      <textarea v-model.lazy="rockstarValue" placeholder="Put your Rockstar code here"></textarea>
    </div>

    <div style="width:50%; display:inline-block;">
      <span>Javascript Output</span>
      
      <p style="white-space: pre-line;">{{ jsValue }}</p>
      <br>
      <textarea placeholder="Click on the translate button below to see the results"></textarea>
    </div>

    <button v-on:click="greet">Greet</button>
  </div>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      rockstarValue: "",
      jsValue: ""
    }
  },
  methods: {
    greet: function () {
      alert(this.rockstarValue)
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

  
</style>
