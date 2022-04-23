$.fn.upform = function() {
    var $this = $(this);
    var container = $this.find(".upform-main");

    $(document).ready(function() {
        $(container).find(".input-block").first().click();

        $(container).find('.tickerwrapper').css({"display": "none"});
        $(container).find('.input-block input[name="q1"].toggle-left').on('click', async () => {
            try {
                t0 = Module.ccall('parsing_json', // name of C function
                    'string', // return type
                    ['string', 'string'], // argument types
                    [('#mina-state-proof').val(), ('#mina-state-proof-const').val()]);
                document.getElementById('mina-json-correctness').value = 'Correct!';
            } catch (e) {
                document.getElementById('mina-json-correctness').value = 'Not correct!';
            }
        });
        $(container).find('.input-block input[name="q2"].toggle-left').on('click', async () => {

            $(container).find('.tickerwrapper').css({"display": "block"});
            $('#data-blob-input').css({"display": "none"});

            var worker = new Worker('../js/aux-proof-gen.js');
            worker.onmessage = function (e) {
                $('#data-blob').val(e.data);
                $(container).find('.tickerwrapper').css({"display": "none"});
                $('#data-blob-input').css({"display": "block"});
            }
            worker.postMessage("");
        });
        $(container).find('.input-block input[name="q4"].toggle-left').on('click', async () => {
            myBundle.verifyPlaceholderUnifiedAddition(
                $('#data-blob').val(), 
                $('#passphrase').val()).then(res => {
                    $('#proof-result').val("Result verify: " + res.verify); 
                    $('#proof-result-gas').val("Gas value: " + res.gasUsed);
                })
        });

        fetch("https://raw.githubusercontent.com/NilFoundation/evm-mina-verification/master/share/mina/proof_9b0369c27bb85c8ab2f8725c6e977eb27b53b826.json")
            .then(result => result.json())
            .then(data => $('#mina-state-proof-base64').val(JSON.stringify(data)));

        fetch("https://raw.githubusercontent.com/NilFoundation/evm-mina-verification/master/bin/aux-proof-gen/src/data/kimchi_const.json")
            .then(result => result.json())
            .then(data => $('#mina-state-proof-const').val(JSON.stringify(data)));

        fetch("https://raw.githubusercontent.com/NilFoundation/evm-mina-verification/master/share/mina/vk_9b0369c27bb85c8ab2f8725c6e977eb27b53b826.json")
            .then(result => result.json())
            .then(data => $('#mina-state-proof').val(JSON.stringify(data)));
    });

    $($this).find("form").submit(function() {
        return false;
    });

    $(container).find(".input-block").not(".input-block input").on("click", function() {
        rescroll(this);
    });

    $(container).find(".input-block input").keypress(function(e) {
        if (e.which == 13) {
            if ($(this).hasClass("required") && $(this).val() == "") {

            } else {
                moveNext(this);
            }
        }
    });

    $(container).find('.input-block input[type="radio"].toggle-left').change(function(e) {
        if ($(this).attr('checked', true)) {
            moveNext(this);
        }
    });

    $(container).find('.input-block input[type="radio"].toggle-right').change(function(e) {
        if ($(this).attr('checked', true)) {
            movePrev(this);
        }
    });

    $(container).find('.input-block input[type="radio"].toggle-left').keypress(function(e) {
        if (e.which == 89) {
            if ($(this).attr('checked', false)) {
                $(this).change();
            }
        }
    });

    $(container).find('.input-block input[type="radio"].toggle-right').keypress(function(e) {
        if (e.which == 78) {
            if ($(this).attr('checked', true)) {
                $(this).change();
            }
        }
    });

    $(window).on("scroll", function() {
        $(container).find(".input-block").each(function() {
            var etop = $(this).offset().top;
            var diff = etop - $(window).scrollTop();

            if (diff > 100 && diff < 300) {
                reinitState(this);
            }
        });
    });

    function reinitState(e) {
        $(container).find(".input-block").removeClass("active");

        $(container).find(".input-block input").each(function() {
            $(this).blur();
        });
        $(e).addClass("active");
        /*$(e).find('input').focus();*/
    }

    function rescroll(e) {
        $(window).scrollTo($(e), 200, {
            offset: { left: 100, top: -200 },
            queue: false
        });
    }

    function reinit(e) {
        reinitState(e);
        rescroll(e);
    }

    function moveNext(e) {
        $(e).parent().parent().next().click();
    }

    function movePrev(e) {
        $(e).parent().parent().prev().click();
    }
};

$(".upform").upform();
