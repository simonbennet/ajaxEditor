$(function () {
    var ajaxediter = function () {
        var _validateRegexMap = {
            "ChineseIdCard": /(^\d{15}$)|(^\d{17}([0-9]|X)$)/
        };

        var getValidateRegex = function (validateParams) {
            return _validateRegexMap[validateParams] ? _validateRegexMap[validateParams] : validateParams;
        };

        var isEmpty = function (val) {
            return $.type(val) == 'undefined' || val == "";
        };
        var notUndefined = function (obj) {
            return $.type(obj) != 'undefined';
        };

        $(function () {
            var $ajaxForms = $(".ajax-form");
            $ajaxForms.each(function () {
                var $ajaxForm = $(this);
                var $editButton = $ajaxForm.find(".ajax-form-btn-edit");
                var $submitButton = $ajaxForm.find(".ajax-form-btn-submit");
                var $cancelButton = $ajaxForm.find(".ajax-form-btn-cancel");

                $submitButton.hide();
                $cancelButton.hide();

                // 绑定提交按钮事件
                $submitButton.click(function (event) {
                    $ajaxForm.find(".text-danger").remove(); // 清除所有警告信息

                    var $inputs = $ajaxForm.find("[ajax-temp-input]");
                    var datas = {};
                    $.each($inputs.serializeArray(), function () {
                        datas[this.name] = this.value;
                    });

                    var requireGroupResult = {};
                    $ajaxForm.find(".ajax-form-input").each(function () {
                        var $this = $(this);
                        var label = $this.attr("ajax-data-label");
                        var input_name = $this.attr("name");
                        var $input = $("input[name=" + input_name + "]");
                        var input_value = $input.val();
                        // check require
                        if (notUndefined($this.attr("ajax-input-require"))) {
                            var requireGroup = $this.attr("ajax-input-require");
                            if (!isEmpty(requireGroup)) {
                                if (requireGroupResult[requireGroup] == requireGroup) { // this require group is not empty
                                    return true; // continue
                                } else if (isEmpty(requireGroupResult[requireGroup])) {
                                    requireGroupResult[requireGroup] = [];
                                }
                                if (isEmpty(input_value)) {
                                    requireGroupResult[requireGroup].push($input);
                                } else {
                                    requireGroupResult[requireGroup] = requireGroup;
                                }
                            } else {
                                if (isEmpty(input_value)) {
                                    $input.after("<span name='" + input_name + "' class='text-danger' ajax-validate-failed >" + label + "不能为空" + "</span>");
                                }
                            }
                        }

                        // check validate
                        if (notUndefined($this.attr("ajax-data-validate"))) {
                            var validateRegex = getValidateRegex($this.attr("ajax-data-validate"));
                            if (isEmpty(input_value)) {
                                if (!validateRegex.test(input_value)) {
                                    $input.after("<span name='" + input_name + "' class='text-danger' ajax-validate-failed >" + label + "格式不正确" + "</span>");
                                    validateIdCard = false;
                                }
                            }
                        }

                        // remote check validate
                        if (notUndefined($this.attr("ajax-data-validate-action"))) {
                            if ($("span[name=" + name + "][ajax-validate-failed]") == 0) {
                                var requestData = {};
                                requestData[input_name] = input_value;
                                var validateUrl = $this.attr("ajax-data-validate-action");
                                $.ajax({
                                    type: "POST",//提交方式：post|get
                                    async: false,//执行方式：true|false
                                    cache: false,//是否缓存：true|false
                                    url: validateUrl,//提交位置
                                    data: requestData,//传递参数
                                    dataType: "JSON",//返回值类型
                                    success: function (data)//AJAX执行成功调用函数
                                    {
                                        if (data.status == 'failed') {
                                            $input.after("<span name='" + input_name + "' class='text-danger' ajax-validate-failed >" + data.message + "</span>");
                                        }
                                    },
                                    error: function (xmlhttp, state, msg)//AJAX执行失败调用函数
                                    {

                                    }
                                });
                            }
                        }

                    });

                    $.each(requireGroupResult, function (requireGroup, value) {
                        if ($.type(value) == 'array') {
                            var $inputArray = $(this);
                            var labels = "";
                            $ajaxForm.find(".ajax-form-input[ajax-input-require=" + requireGroup + "]").each(function () {
                                labels += $(this).attr("ajax-data-label") + " ";
                            });
                            $inputArray.each(function () {
                                var $input = $(this);
                                $input.after("<span name='" + $input.attr('name') + "' class='text-danger' ajax-validate-failed >" + labels + "至少填一项" + "</span>")
                            });
                        }
                    });

                    if ($ajaxForm.find("[ajax-validate-failed]").size() == 0) {
                        $(".ajax-form").find("[ajax-data-submit]").each(function () {
                            var $this = $(this);
                            var submitUrl = $this.attr("ajax-data-submit");

                            $.ajax({
                                type: "POST",//提交方式：post|get
                                async: false,//执行方式：true|false
                                cache: false,//是否缓存：true|false
                                url: submitUrl,//提交位置
                                data: datas,//传递参数
                                dataType: "JSON",//返回值类型
                                success: function (data)//AJAX执行成功调用函数
                                {
                                    if (data.status == 'ok') {
                                        alert(data.message);
                                        window.location.reload();
                                    } else {
                                        alert(data.message)
                                    }
                                },
                                error: function (xmlhttp, state, msg)//AJAX执行失败调用函数
                                {

                                }
                            });
                        })
                    }
                });

                // 绑定编辑按钮事件
                $editButton.click(function (event) {
                    var $input_origins = $ajaxForm.find(".ajax-form-input");
                    $input_origins.each(function () {
                        var $this = $(this);
                        $this.after("<input name='" + $(this).attr("name") + "' ajax-temp-input value='" + $(this).text() + "'/>");
                        $this.hide();
                    });
                    $editButton.hide();
                    $submitButton.show();
                    $cancelButton.show();
                });

                // 绑定取消按钮事件
                $cancelButton.click(function (event) {
                    $ajaxForm.find(".text-danger").remove(); // 清除所有警告信息
                    var $inputs = $ajaxForm.find("[ajax-temp-input]");
                    $inputs.remove();
                    var $input_origins = $ajaxForm.find(".ajax-form-input");
                    $input_origins.show();

                    $editButton.show();
                    $submitButton.hide();
                    $cancelButton.hide();
                });
            })
        });
        return;
    };
    ajaxediter();
});


